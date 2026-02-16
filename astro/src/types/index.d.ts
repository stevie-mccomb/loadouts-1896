import type { Document as StrapiDocument } from 'node_modules/@strapi/client/dist/types/content-api';

interface AmmoType extends StrapiDocument
{
    name: string;
    slug: string;
};

interface Consumable extends StrapiDocument
{
    name: string;
    utility: Utility;
};

interface Tool extends StrapiDocument
{
    name: string;
    utility: Utility;
};

interface Utility extends StrapiDocument
{
    name: string;
    slug: string;
};

interface Weapon extends StrapiDocument
{
    name: string;
    slots: WeaponSlot;
    can_akimbo: boolean;
    ammo_types: AmmoType[];
    ammo_slots: number;
};

type WeaponSlot = 'one'|'two'|'three';
