import { AdvancedFilterModule, ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, DateFilterModule, NewFiltersToolPanelModule, NumberFilterModule, PaginationModule, ServerSideRowModelModule, SetFilterModule, TextFilterModule, type ColDef, type FilterWrapperParams, type GridReadyEvent, type IServerSideDatasource, type IServerSideGetRowsParams, type SetFilterValuesFuncParams } from "ag-grid-enterprise";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef } from "react";
import { getRevisionStatusEnums, searchDocumentRevisionsAdvanced, searchDocumentRevisionsAdvancedCountTotal } from "./apiClient";
import type { AgGridProps, RevisionSearchResponse, RevisionsSearchPageableRequest } from "./types";

const modules = [
    SetFilterModule,
    DateFilterModule,
    AdvancedFilterModule,
    TextFilterModule,
    NumberFilterModule,
    NewFiltersToolPanelModule,
    PaginationModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ServerSideRowModelModule
];

const getRevisionStateEnumAsync = async (params: SetFilterValuesFuncParams) => {
    try {
        const revisionStatuses = await getRevisionStatusEnums();
        params.success(revisionStatuses);

    } catch (error) {
        console.error('Chyba pri načítavaní stavov revízií:', error);
        params.success([]);
    }
};

const TestGridAdvancedFilter = ({ jwtToken }: AgGridProps) => {

    const pageTokenRef = useRef<string | null>(null);
    const totalCountRef = useRef<number | undefined>(undefined);

    const columnDefs: ColDef<RevisionSearchResponse>[] = useMemo(() => [
        { field: 'revisionId', headerName: 'ID Revízie', sortable: true, filter: true },
        { field: 'revisionTitle', headerName: 'Názov Revízie', sortable: true, filter: true },
        { field: 'revisionNumber', headerName: 'Číslo Revízie', sortable: true, filter: true },
        {
            field: 'currentRevisionStatus',
            headerName: 'Stav',
            sortable: true,
            filter: "agSetColumnFilter", // toto nefunguje
            filterParams: {
                values: getRevisionStateEnumAsync,
                suppressClearModelOnRefreshValues: true,
            }
        },
        {
            field: 'revisionDate',
            headerName: 'Datum',
            filter: true,
            cellDataType: "dateTime",
            sortable: true,

        },
        {
            headerName: 'Druh dokument',
            valueGetter: params => params.data?.document?.documentKind,
            colId: 'document.documentKind',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Číslo Dokumentu',
            valueGetter: params => params.data?.document?.documentNumber,
            colId: 'document.documentNumber',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Autor Dokumentu',
            valueGetter: params => params.data?.document?.author,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Kategorie',
            valueGetter: params => params.data?.document?.categories,
            sortable: true,
            filter: true
        }
    ], []);

    const defaultColDef = useMemo<ColDef>(() => ({
        flex: 1,
        minWidth: 120,
        resizable: true,
        filter: true,
        filterParams: {
            buttons: ["apply"], // set all filters to use buttons
        } as FilterWrapperParams,
        suppressHeaderMenuButton: true,
        suppressHeaderContextMenu: true,
    }), []);

    const createServerSideDatasource = (): IServerSideDatasource => {
        return {
            getRows: async (params: IServerSideGetRowsParams) => {
                const payload: RevisionsSearchPageableRequest = {
                    pageToken: pageTokenRef.current,
                    startRow: params.request.startRow ?? 0,
                    endRow: params.request.endRow ?? 10,
                    sortModel: params.request.sortModel ?? [],
                    filterModel: params.request.filterModel
                };

                try {
                    const responseData = await searchDocumentRevisionsAdvanced(payload, jwtToken);

                    pageTokenRef.current = responseData.pageToken ?? null;

                    let totalCount;
                    if (totalCountRef.current == undefined) {

                        const totalCountResponse = await searchDocumentRevisionsAdvancedCountTotal(payload, jwtToken);

                        totalCount = totalCountResponse.totalCount
                        totalCountRef.current = totalCount;

                        // FIXME: tu vypnes pocitanie total cout ak to dlho trva
                        // totalCountRef.current = undefined;
                    } else {
                        console.log("Total count " + totalCountRef.current)
                        totalCount = totalCountRef.current;
                    }

                    params.success({
                        rowData: responseData.rowData,
                        // rowCount: 100
                        rowCount: totalCount
                    });
                } catch (error) {
                    console.error('Chyba komunikácie s be4fe backendom:', error);
                    params.fail();
                }
            }
        };
    };

    const onGridReady = useCallback((event: GridReadyEvent) => {
        const ds = createServerSideDatasource();
        event.api!.setGridOption("serverSideDatasource", ds)
    }, []);

    const onFilterChanged = useCallback((params: any) => {
        console.log('Filter sa zmenil, resetujem totalCountRef...');

        totalCountRef.current = undefined;
        pageTokenRef.current = null;
    }, []);

    return (

        <div style={{ width: "100%", height: "500px" }}>
            <AgGridProvider modules={modules} >
                <AgGridReact
                    multiSortKey="ctrl"
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowModelType="serverSide"
                    cacheBlockSize={10}
                    onGridReady={onGridReady}
                    onFilterChanged={onFilterChanged}

                    pagination={true}
                    paginationPageSize={10}

                    enableAdvancedFilter={true}
                    suppressSetFilterByDefault={true}
                />
            </AgGridProvider>
        </div>
    )
}

export default TestGridAdvancedFilter