import type { IFilterParams } from 'ag-grid-community';
import { forwardRef, useImperativeHandle, useState } from 'react';

const FullTextSearchCustomFilter = forwardRef((props: IFilterParams, ref) => {
    const [filterValue, setFilterValue] = useState<string | null>(null);

    useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return filterValue != null && filterValue.trim() !== '';
            },

            getModel() {
                if (!filterValue) return null;
                return {
                    filterType: 'fullTextSearch',
                    filter: filterValue
                };
            },

            setModel(model: any) {
                setFilterValue(model ? model.filter : null);
            },

            doesFilterPass(params: any) {
                return true;
            }
        };
    });

    return <div style={{ display: 'none' }}></div>;
});

export default FullTextSearchCustomFilter;