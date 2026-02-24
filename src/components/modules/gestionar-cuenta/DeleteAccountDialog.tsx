import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Text } from "@/src/components/ui/text";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Cuenta</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se
            puede deshacer. Tus datos se eliminarán definitivamente en los
            próximos 30 días.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={() => onOpenChange(false)}>
            <Text>Cancelar</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive active:bg-destructive/90 text-white"
            onPress={onConfirm}
          >
            <Text>Eliminar Cuenta</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

