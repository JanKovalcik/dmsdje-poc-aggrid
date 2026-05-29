import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, DateFilterModule, MultiFilterModule, NewFiltersToolPanelModule, NumberFilterModule, PaginationModule, ServerSideRowModelModule, SetFilterModule, TextFilterModule, type ColDef, type FilterWrapperParams, type GridReadyEvent, type IServerSideDatasource, type IServerSideGetRowsParams, type SetFilterValuesFuncParams } from "ag-grid-enterprise";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { getDocumentKindEnums, getRevisionStatusEnums, searchDocumentRevisions } from "./apiClient";
import FullTextSearchCustomFilter from "./FullTextSearchCustomFilter";
import type { RevisionSearchResponse, RevisionsSearchPageableRequest } from "./types";

const modules = [
    MultiFilterModule,
    SetFilterModule,
    DateFilterModule,
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

const getDocumentKindEnumAsync = async (params: SetFilterValuesFuncParams) => {
    try {
        const documentKinds = await getDocumentKindEnums();
        params.success(documentKinds);

    } catch (error) {
        console.error('Chyba pri načítavaní stavov revízií:', error);
        params.success([]);
    }
};

const TestGridColumnFilter = () => {
    // ToDo: TU SI DOPLN TOKEN 
    const jwtToken = "XXX";

    const pageTokenRef = useRef<string | null>(null);
    const gridRef = useRef<AgGridReact<RevisionSearchResponse>>(null);
    const [fullTextSearchFilter, setFullTextSearchFilter] = useState<string>('');

    const columnDefs: ColDef[] = useMemo(() => [
        {
            field: 'fullTextSearch',
            hide: true,
            filter: FullTextSearchCustomFilter,
            suppressHeaderMenuButton: true,
        },
        { field: 'revisionId', headerName: 'ID Revízie', sortable: true, filter: true },
        { field: 'revisionTitle', headerName: 'Názov Revízie', sortable: true, filter: true },
        { field: 'revisionNumber', headerName: 'Číslo Revízie', sortable: true, filter: true },
        {
            field: 'currentRevisionStatus',
            headerName: 'Stav',
            sortable: true,
            filter: "agSetColumnFilter",
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
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: "agTextColumnFilter",
                        filterParams: {
                            defaultOption: "equals",
                        },
                    },
                    {
                        filter: "agSetColumnFilter",
                        filterParams: {
                            values: getDocumentKindEnumAsync,
                            suppressClearModelOnRefreshValues: true,
                        },
                    },
                ],
            }
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
            headerName: 'kategorie',
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
                    const responseData = await searchDocumentRevisions(payload, jwtToken);

                    pageTokenRef.current = responseData.pageToken ?? null;

                    params.success({
                        rowData: responseData.rowData,
                        // rowCount: 100
                        // rowCount: responseData.lastRow // ToDo: JKO fixni celkovy pocet
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

    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const handleExternalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fulltextSearchNewValue = event.target.value;
        setFullTextSearchFilter(event.target.value);

        if (gridRef.current && gridRef.current.api) {
            const api = gridRef.current.api;

            // 1. Získame aktuálny filter model (všetky filtre, čo si užívateľ naklikal)
            const currentModel = api.getFilterModel();

            // 2. Ak používateľ niečo napísal, pridáme/aktualizujeme náš skrytý filter
            if (fulltextSearchNewValue && fulltextSearchNewValue.trim() !== '') {
                currentModel['fullTextSearch'] = {
                    filterType: 'fulltextsearch',
                    filter: fulltextSearchNewValue
                };
            } else {
                // Ak input vymazal, náš filter z modelu odstránime
                delete currentModel['fullTextSearch'];
            }

            // 3. Natlačíme nový model do AG Gridu.
            // TOTO AUTOMATICKY VYVOLÁ getRows() SO SPRÁVNYMI DÁTAMI!
            api.setFilterModel(currentModel);
        }
    };

    return (
        <div>
            <div>table</div>
            <div style={{ width: "100%", height: "500px" }}>
                <AgGridProvider modules={modules} >
                    <div style={containerStyle}>
                        <div className="test-container">
                            <div className="test-header">
                                <label>
                                    <input
                                        name="fullTextSearchInput"
                                        id="fullTextSearchInput"
                                        onChange={handleExternalSearchChange}
                                    />
                                    Full Text Search
                                </label>
                            </div>
                        </div>


                        <div style={gridStyle}>
                            <AgGridReact
                                ref={gridRef}

                                multiSortKey="ctrl"
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowModelType="serverSide"
                                cacheBlockSize={10}
                                onGridReady={onGridReady}

                                pagination={true}
                                paginationPageSize={10}

                                suppressSetFilterByDefault={true}

                            />
                        </div>
                    </div>
                </AgGridProvider>
            </div>
        </div >
    )
}

export default TestGridColumnFilter