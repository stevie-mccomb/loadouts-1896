<script setup lang="ts">
    import { useStrapi } from '@composables/useStrapi';
    import { random } from '@helpers/arrays';
    import { randomBoolean } from '@helpers/booleans';
    import { randomInt } from '@helpers/numbers';
    import type { AmmoType, Consumable, Tool, Weapon } from '@types';
    import type { BaseQueryParams } from 'node_modules/@strapi/client/dist/types/content-api';
    import { onMounted, ref } from 'vue';

    const loadingIcon = random([ 'fa-hat-cowboy', 'fa-badge-sheriff', 'fa-boot-heeled', 'fa-horse-saddle', 'fa-skull-cow' ]);
    const isLoading = ref(true);

    const dbWeapons = ref<Weapon[]>([]);
    const dbTools = ref<Tool[]>([]);
    const dbConsumables = ref<Consumable[]>([]);

    const primaryWeapon = ref<Weapon>();
    const primaryWeaponAmmoSlots = ref<AmmoType[]>([]);
    const isPrimaryWeaponAkimbo = ref<boolean>(false);
    const secondaryWeapon = ref<Weapon>();
    const secondaryWeaponAmmoSlots = ref<AmmoType[]>([]);
    const isSecondaryWeaponAkimbo = ref<boolean>(false);
    const requiresQuartermaster = ref<boolean>(false);
    const tools = ref<Tool[]>([]);
    const consumables = ref<Consumable[]>([]);

    onMounted(() => {
        const queryParams: BaseQueryParams = {
            populate: '*',
            pagination: {
                pageSize: 100,
            },
        };

        useStrapi().collection('weapons').find(queryParams).then(response => {
            dbWeapons.value = response.data.map(d => d as Weapon);
            onLoadedModels();
        });

        useStrapi().collection('tools').find(queryParams).then(response => {
            dbTools.value = response.data.map(d => d as Tool);
            onLoadedModels();
        });

        useStrapi().collection('consumables').find(queryParams).then(response => {
            dbConsumables.value = response.data.map(d => d as Consumable);
            onLoadedModels();
        });
    });

    const onLoadedModels = () => {
        if (dbWeapons.value.length && dbTools.value.length && dbConsumables.value.length) {
            isLoading.value = false;
            onRandomize();
        }
    };

    const onRandomize = () => {
        const totalSlots = 5;
        let slotsUsed: number = 0;

        primaryWeapon.value = random<Weapon>(dbWeapons.value);
        slotsUsed += getWeaponSlots(primaryWeapon.value);

        primaryWeaponAmmoSlots.value = [];
        if (primaryWeapon.value.ammo_types.length) {
            for (let i = 0; i < primaryWeapon.value.ammo_slots; ++i) {
                primaryWeaponAmmoSlots.value.push(random(primaryWeapon.value.ammo_types));
            }
        }
        if (primaryWeapon.value.can_akimbo) {
            isPrimaryWeaponAkimbo.value = randomBoolean();
            if (isPrimaryWeaponAkimbo.value) {
                slotsUsed += 1;
            }
        } else {
            isPrimaryWeaponAkimbo.value = false;
        }

        const potentialSecondaryWeapons = dbWeapons.value.filter(weapon => {
            return getWeaponSlots(weapon) <= (totalSlots - slotsUsed);
        });
        secondaryWeapon.value = random<Weapon>(potentialSecondaryWeapons);
        slotsUsed += getWeaponSlots(secondaryWeapon.value);

        secondaryWeaponAmmoSlots.value = [];
        if (secondaryWeapon.value.ammo_types.length) {
            for (let i = 0; i < secondaryWeapon.value.ammo_slots; ++i) {
                secondaryWeaponAmmoSlots.value.push(random(secondaryWeapon.value.ammo_types));
            }
        }

        if (secondaryWeapon.value.can_akimbo && (totalSlots - slotsUsed) >= 1) {
            isSecondaryWeaponAkimbo.value = randomBoolean();
            if (isSecondaryWeaponAkimbo.value) {
                slotsUsed += 1;
            }
        } else {
            isSecondaryWeaponAkimbo.value = false;
        }

        requiresQuartermaster.value = slotsUsed >= 5;

        tools.value = [];
        const medkit = dbTools.value.find(t => t.name === 'Medkit');
        if (!medkit) {
            throw new Error('Could not find medkit! Medkit is a required tool.');
        }
        tools.value.push(medkit);

        const meleeTools = dbTools.value.filter(t => t?.utility?.slug === 'melee');
        tools.value.push(random(meleeTools));

        const otherTools = dbTools.value.filter(t => t.name !== 'Medkit' && t?.utility?.slug !== 'melee');
        const countOtherTools = randomInt(0, 2);
        for (let i = 0; i < countOtherTools; ++i) {
            tools.value.push(random(otherTools));
        }

        consumables.value = [];
        const countConsumables = randomInt(0, 4);
        for (let i = 0; i < countConsumables; ++i) {
            consumables.value.push(random(dbConsumables.value));
        }
    };

    const getWeaponSlots = (weapon: Weapon): number => {
        switch (weapon.slots) {
            case 'one':
                return 1;

            case 'two':
                return 2;

            case 'three':
            default:
                return 3;
        }
    };
</script>

<template>
    <div v-if="isLoading" class="w-full h-full flex justify-center items-center text-8xl">
        <span class="fa-duotone fa-solid fa-spin" :class="loadingIcon"></span>
    </div>

    <div v-else class="flex flex-col gap-4">
        <section class="flex flex-col gap-4 p-4 rounded border border-stone-700">
            <h2 class="text-xl">
                Weapons
            </h2>

            <div v-if="primaryWeapon" class="flex flex-col rounded bg-stone-950 border border-stone-700">
                <div class="flex-1 p-4">
                    {{ primaryWeapon.name }} <span v-if="isPrimaryWeaponAkimbo">(Dual-wield)</span>
                </div>

                <div v-if="primaryWeaponAmmoSlots.length" class="flex w-full border-t border-stone-700">
                    <div v-for="ammoSlot in primaryWeaponAmmoSlots" class="px-4 py-2 flex-1 flex border-l first:border-0 border-stone-700">
                        {{ ammoSlot.name }}
                    </div>
                </div>
            </div>

            <div v-if="secondaryWeapon" class="flex flex-col rounded bg-stone-950 border border-stone-700">
                <div class="flex-1 p-4">
                    {{ secondaryWeapon.name }} <span v-if="isSecondaryWeaponAkimbo">(Dual-wield)</span>
                </div>

                <div v-if="secondaryWeaponAmmoSlots.length" class="flex w-full border-t border-stone-700">
                    <div v-for="ammoSlot in secondaryWeaponAmmoSlots" class="px-4 py-2 flex-1 flex border-l first:border-0 border-stone-700">
                        {{ ammoSlot.name }}
                    </div>
                </div>
            </div>

            <div v-if="requiresQuartermaster" class="flex rounded bg-stone-950 border border-stone-700">
                <div class="p-4 rounded-l bg-stone-800 border-r border-stone-700">
                    <span class="fal fa-exclamation-triangle"></span>
                </div>

                <div class="p-4">
                    Quartermaster
                </div>
            </div>
        </section>

        <section class="flex flex-col gap-4 p-4 rounded border border-stone-700">
            <h2 class="text-xl">
                Tools
            </h2>
        
            <div v-if="tools.length" class="grid grid-cols-2 gap-4">
                <div v-for="tool in tools" class="p-4 rounded bg-stone-950 border border-stone-700">
                    {{ tool.name }}
                </div>
            </div>

            <p v-else>
                None
            </p>
        </section>

        <section class="flex flex-col gap-4 p-4 rounded border border-stone-700">
            <h2 class="text-xl">
                Consumables
            </h2>

            <div v-if="consumables.length" class="grid grid-cols-2 gap-4">
                <div v-for="consumable in consumables" class="flex-1 p-4 rounded bg-stone-950 border border-stone-700">
                    {{ consumable.name }}
                </div>
            </div>

            <p v-else>
                None
            </p>
        </section>

        <button type="button" @click="onRandomize" class="w-full px-4 py-2 rounded border border-stone-700 bg-stone-800 shadow-xl">
            Randomize
        </button>
    </div>
</template>
