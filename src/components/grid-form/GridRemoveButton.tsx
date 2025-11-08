interface GridRemoveButtonProps {
    // Callback function to remove data from form grid
    onRemove: () => void;
}

// Button component used to remove data from form grid
export default function GridRemoveButton({
    onRemove
}: GridRemoveButtonProps) {
    return (
        <div className="remove-btn cursor-pointer" onClick={onRemove}>삭제</div>
        // <img className="remove-btn cursor-pointer" src={ adminRemoveIcon: userRemoveIcon} onClick={onRemove} />
    );
}