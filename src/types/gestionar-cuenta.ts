export interface AccountOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  onPress: () => void;
  variant?: "default" | "destructive";
}

export interface SettingsGroup {
  id: string;
  title: string;
  options: AccountOption[];
}


