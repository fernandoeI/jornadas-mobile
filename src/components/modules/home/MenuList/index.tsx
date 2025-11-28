import {
  MenuItem,
  MenuItemComponent,
} from "@/src/components/modules/home/MenuItem";
import { View } from "react-native";

interface MenuListProps {
  items: MenuItem[];
  onItemPress: (route: string) => void;
}

export const MenuList: React.FC<MenuListProps> = ({ items, onItemPress }) => {
  return (
    <View className="w-full">
      {items.map((item, index) => (
        <MenuItemComponent
          key={index}
          item={item}
          onPress={() => onItemPress(item.route)}
        />
      ))}
    </View>
  );
};
