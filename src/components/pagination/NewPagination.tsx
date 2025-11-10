import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import {
    Box, MenuItem, Pagination, PaginationItem, PaginationProps, PaginationRenderItemParams, Select, SelectChangeEvent 
} from '@mui/material';
import { PaginationDataProps } from '@type/table.type';
import { changePagination } from '@utils/table.util';

/**
 * Render pagination item
 * @param params props to spread on a PaginationItem.
 */
function renderItem(params: PaginationRenderItemParams) {
    return (
        <PaginationItem
            slots={{ 
                previous: KeyboardArrowLeft, 
                next: KeyboardArrowRight 
            }}
            {...params}
        />
    );
}

interface NewPaginationProps extends PaginationProps {
    // pagination props
    paginationProps?: PaginationDataProps;
}

export default function NewPagination({
    paginationProps,
    ...others
}: NewPaginationProps) {
    const pagination = paginationProps?.pagination;
    const rowPages = [10, 25, 50, 100];
    const rowPagesOptions = rowPages.map((rowPage) => ({
        value: rowPage,
        label: `${rowPage}`
    }));
    const setPagination = paginationProps?.setPagination;

    /**
     * Handle page changed
     * @param event event source
     * @param page selected page
     */
    function handlePageChange(event: React.ChangeEvent<unknown>, page: number) {
        if (!setPagination) {
            return;
        }

        changePagination(setPagination, 'currentPage', page);
    }

    /**
     * Handle row per page input changed
     * @param event event source
     */
    function handleRowChange(event: SelectChangeEvent<string | number>) {
        if (!setPagination) {
            return;
        }

        setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            rowsPerPage: event.target.value as unknown as number
        }));
    }

    return (
        <Box className="relative flex items-center justify-center w-[100%] h-[48px]">
            <div className="absolute left-[10px]">
                {/* <select */}
                <Select value={pagination?.rowsPerPage} onChange={handleRowChange}>
                    {rowPagesOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value.toString()}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </div>
            <Pagination
                renderItem={renderItem}
                onChange={handlePageChange}
                page={pagination?.currentPage}
                count={pagination?.totalPages}
                {...others}
            />
        </Box>
    );
}