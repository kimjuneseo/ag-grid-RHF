import userAddIcon from '@assets/add_circle.png';

interface GridAddButtonProps {
    // Callback function to append data to form grid
    onAppend: () => void;
}

// Button component used to append data to form grid
export default function GridAddButton({
    onAppend
}: GridAddButtonProps) {
    return (
        <img className="cursor-pointer" src={userAddIcon.src} onClick={onAppend} />
    );
}