/// <reference path="../.astro/types.d.ts" />
/// <reference path="../worker-configuration.d.ts" />

declare module "*.css";

declare namespace App {
  interface Locals {
    isArmenia: boolean;
  }
}
