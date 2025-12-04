import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import type { TriggerRef } from "@rn-primitives/select";
import type React from "react";
import type { Control, FieldErrors } from "react-hook-form";

export interface Localidad {
  id: number;
  nombre: string;
}

export interface ContentInsets {
  top: number;
  bottom: number | undefined;
  left: number;
  right: number;
}

export interface UseDireccionProps {
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  onNext: () => void;
  validateAndNextRef?: React.RefObject<(() => Promise<void>) | null>;
}

export interface IDireccion {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  municipioRef: React.RefObject<TriggerRef | null>;
  localidadRef: React.RefObject<TriggerRef | null>;
  asentamientoTipoRef: React.RefObject<TriggerRef | null>;
  vialidadTipoRef: React.RefObject<TriggerRef | null>;
  comprobanteDomicilioRef: React.RefObject<TriggerRef | null>;
  contentInsets: ContentInsets;
  onBack: () => void;
  onNext: () => void;
  showButtons?: boolean;
  validateAndNextRef?: React.RefObject<(() => Promise<void>) | null>;
}
