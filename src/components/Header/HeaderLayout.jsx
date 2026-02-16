import { Bell } from 'lucide-react';
import { InputSearch } from '../Input/InputSearch';
import { AvatarDropdown } from '../Avatar/Avatar';
export const HeaderLayout = () => {
  return (
    <>
      <InputSearch></InputSearch>
      <div className="flex items-center gap-5">
        <Bell />
        <AvatarDropdown></AvatarDropdown>
      </div>
    </>
  );
};
