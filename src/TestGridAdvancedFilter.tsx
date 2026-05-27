import { AdvancedFilterModule, ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, DateFilterModule, NewFiltersToolPanelModule, NumberFilterModule, PaginationModule, ServerSideRowModelModule, TextFilterModule, type ColDef, type FilterWrapperParams, type GridReadyEvent, type IServerSideDatasource, type IServerSideGetRowsParams } from "ag-grid-enterprise";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef } from "react";
import { searchDocumentRevisionsAdvanced } from "./apiClient";
import type { RevisionSearchResponse, RevisionsSearchPageableRequest } from "./types";

const modules = [
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

const TestGridAdvancedFilter = () => {
    const jwtToken = "eyJ4NXQiOiJPRGd4TTJKaFlqYzBOMkZrTW1FNU1HTTFaakExTmpsaE5qQXhOREU1TnpSa1lqWmhPRGs0T1RjMk5XSm1OalZpTUdNMU4yVmxZbVJoWkRBeE1tSXhPQSIsImtpZCI6Ik9EZ3hNMkpoWWpjME4yRmtNbUU1TUdNMVpqQTFOamxoTmpBeE5ERTVOelJrWWpaaE9EazRPVGMyTldKbU5qVmlNR00xTjJWbFltUmhaREF4TW1JeE9BX1JTMjU2IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJxdGtvdmFsY2phbjEiLCJhdXQiOiJBUFBMSUNBVElPTl9VU0VSIiwiaXNzIjoiaHR0cHM6XC9cL3Rlc3RhdXRoLmNlei5jejo0NDNcL29hdXRoMlwvdG9rZW4iLCJncm91cHMiOlsiWkRNU0RKRV9CUi1QUkFDLURBVEEtQURNSU5JU1RSQVRPUiIsIlpETVNESkVfQlItUFJBQy1GSUxFTkVUU0VSVl9DUkVBVE9SIiwiWkRNU0RKRV9CUi1QUkFDLVJFQURFUiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJxdGtvdmFsY2phbjEiLCJnaXZlbl9uYW1lIjoiSsOhbiIsImF1ZCI6IlJoTHJlUjVaaXdZVWZwZENRS2lVTWgxak1yc2EiLCJ1cG4iOiJqYW4ua292YWxjaWswMUBjZXouY3oiLCJuYmYiOjE3NzkyNzc2MzUsImdyb3Vwc190eXBlIjoiUkEiLCJhenAiOiJSaExyZVI1Wml3WVVmcGRDUUtpVU1oMWpNcnNhIiwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsIm5hbWVzcGFjZSI6IlZZUiIsIm5hbWUiOiJLb3ZhbMSNw61rIErDoW4gKFFUMSkiLCJleHAiOjE3NzkyODEyMzUsImlhdCI6MTc3OTI3NzYzNSwiTXVsdGlBdHRyaWJ1dGVTZXBhcmF0b3IiOltdLCJmYW1pbHlfbmFtZSI6IktvdmFsxI3DrWsiLCJqdGkiOiI0ZTMyZDNlMS0xZGU5LTQzYzAtYTM1NS05M2RmNDUxZmNiZWUiLCJlbWFpbCI6Imphbi5rb3ZhbGNpazAxQGNlei5jeiJ9.kbRXALWL5FzcWaCA2oipowemGLngJFwA6QnCxNEnkgD--2xo__ByzGASVhnr3F9gS6pb949oBFCslm_GUjJdKBCPMgjQW5KPga0mdJwR3pd7HuwQnWhhXKGTxnOIcudQSeo5G4Q-vjVnMRla7ljL8wl9Ib3M03S41QE7p-J-fU1-oibUCUfjraovdM53w6QvIyVmIHi04D4a_k3NZMT4-RTsMZhKstfHh-xXWLemZDgjpFSELOMlC5cJSXLUDX2MmSgHUH-l8XTHQnd_aImwYaPv9HmdjiBQurfeq_hUKH46K-HeNsvC5tos62BxhJwZOW7Q6osSXuToPpkqmtL4KA";

    const pageTokenRef = useRef<string | null>(null);

    const columnDefs: ColDef<RevisionSearchResponse>[] = useMemo(() => [
        { field: 'revisionId', headerName: 'ID Revízie', sortable: true, filter: true },
        { field: 'revisionTitle', headerName: 'Názov Revízie', sortable: true, filter: true },
        { field: 'revisionNumber', headerName: 'Číslo Revízie', sortable: true, filter: true },
        { field: 'currentRevisionStatus', headerName: 'Stav', sortable: true, filter: true },
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

                    params.success({
                        rowData: responseData.rowData,
                        // rowCount: 100
                        // rowCount: responseData.lastRow // FIXME:
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

    return (
        <div>
            <div>table</div>
            <div style={{ width: "100%", height: "500px" }}>
                <AgGridProvider modules={modules} >
                    <AgGridReact
                        multiSortKey="ctrl"
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowModelType="serverSide"
                        cacheBlockSize={10}
                        onGridReady={onGridReady}

                        pagination={true}
                        paginationPageSize={10}

                        enableAdvancedFilter={true}
                        suppressSetFilterByDefault={true}
                    />
                </AgGridProvider>
            </div>
        </div>
    )
}

export default TestGridAdvancedFilter