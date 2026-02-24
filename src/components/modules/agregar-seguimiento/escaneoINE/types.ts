import { AgregarSeguimientoFormData } from "@/src/forms/schemas/AgregarSeguimientoForm";
import type { Control, FieldErrors } from "react-hook-form";

export interface ContentInsets {
  top: number;
  bottom: number | undefined;
  left: number;
  right: number;
}

export interface IEscaneoINE {
  control: Control<AgregarSeguimientoFormData, any, any>;
  errors: FieldErrors<AgregarSeguimientoFormData>;
  values: AgregarSeguimientoFormData;
  setValue: (
    name: keyof AgregarSeguimientoFormData,
    value: any,
    options?: {
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }
  ) => void;
  trigger?: (
    name?: keyof AgregarSeguimientoFormData | (keyof AgregarSeguimientoFormData)[]
  ) => Promise<boolean>;
  contentInsets: ContentInsets;
  onCancel: () => void;
  onNext: () => void;
  showButtons?: boolean;
}

export interface UseEscaneoINEProps {
  values: AgregarSeguimientoFormData;
  errors: FieldErrors<AgregarSeguimientoFormData>;
  setValue: (
    name: keyof AgregarSeguimientoFormData,
    value: any,
    options?: {
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }
  ) => void;
  trigger?: (
    name?: keyof AgregarSeguimientoFormData | (keyof AgregarSeguimientoFormData)[]
  ) => Promise<boolean>;
}

