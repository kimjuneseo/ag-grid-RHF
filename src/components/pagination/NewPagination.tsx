import EgcStyledSelect from '@components/select/EgcStyledSelect';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import {
    Box, Pagination, PaginationItem, PaginationProps, PaginationRenderItemParams, SelectChangeEvent, styled 
} from '@mui/material';
import { PaginationDataProps } from '@type/table.type';
import { changePagination } from '@utils/table.util';
import { getTheme } from '@utils/theme.util';

// change keyboard arrow left icon color
const StyledKeyboardArrowLeft = styled(KeyboardArrowLeft)(() => {
    const theme = getTheme();

    return {
        fill: theme.palette.primary.main,
        '&:hover': {
            fill: theme.palette.primary.dark
        }
    };
});

// change keyboard arrow right icon color
const StyledKeyboardArrowRight = styled(KeyboardArrowRight)(() => {
    const theme = getTheme();

    return {
        fill: theme.palette.primary.main,
        '&:hover': {
            fill: theme.palette.primary.dark
        }
    };
});

/**
 * Render pagination item
 * @param params props to spread on a PaginationItem.
 */
function renderItem(params: PaginationRenderItemParams) {
    return (
        <PaginationItem
            slots={{ 
                previous: StyledKeyboardArrowLeft, 
                next: StyledKeyboardArrowRight 
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
    function handleRowChange(event: SelectChangeEvent<string>) {
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
                <EgcStyledSelect 
                    sx={{ '&.MuiOutlinedInput-root': { width: '80px', height: '28px', borderRadius: '16px', textAlign: 'center' } }}
                    value={pagination?.rowsPerPage as unknown as string}
                    selectList={rowPagesOptions}
                    onChange={handleRowChange}
                />
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