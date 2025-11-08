import { isAdmin } from '@utils/auth.util';
import adminAddIcon from '@assets/images/admin/icons/add_circle.png';
import userAddIcon from '@assets/images/user/icons/add_circle.png';

interface GridAddButtonProps {
    // Callback function to append data to form grid
    onAppend: () => void;
}

// Button component used to append data to form grid
export default function GridAddButton({
    onAppend
}: GridAddButtonProps) {
    return (
        <img className="cursor-pointer" src={isAdmin() ? adminAddIcon : userAddIcon} onClick={onAppend} />
    );
}