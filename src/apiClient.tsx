import axios, { type AxiosResponse } from 'axios';
import type { RevisionsSearchPage, RevisionsSearchPageableRequest } from './types';

const getHeaders = (jwtToken: string) => ({
  'X-Correlation-Id': crypto.randomUUID(),
  'X-JWT-Assertion': jwtToken
});

const fixAgGridDateFilters = (obj: any): any => {
    // Ak to nie je objekt (alebo je to null), vrátime pôvodnú hodnotu
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    // Ak je to pole (napr. zoznam conditions), prebehneme každý prvok
    if (Array.isArray(obj)) {
        return obj.map(item => fixAgGridDateFilters(item));
    }

    // Ak je to objekt, prejdeme jeho kľúče
    const result: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let value = obj[key];

            // TOTO JE MIESTO, KDE SA DEJE KÚZLO:
            // Ak narazíme na kľúč, v ktorom AG Grid drží dátum (dateFrom, dateTo)
            // alebo ak ide o kľúč 'filter' a sme vo filtri typu 'date'
            if (
                (key === 'dateFrom' || key === 'dateTo' || (key === 'filter' && obj.filterType === 'date')) 
                && typeof value === 'string' 
                && value.includes(' ')
            ) {
                // Opravíme formát: "2026-01-01 01:01:01" -> "2026-01-01T01:01:01Z"
                value = value.replace(' ', 'T') + 'Z';
            }

            // Zavoláme rekurziu pre prípad, že vo vnútri sú ďalšie vnorené podmienky (condition1, atď.)
            result[key] = fixAgGridDateFilters(value);
        }
    }

    return result;
};

// 2. POUŽITIE VO TVOJOM KLIENTOVI
const formatOutgoingPayload = (payload: RevisionsSearchPageableRequest): RevisionsSearchPageableRequest => {
    const formattedPayload = JSON.parse(JSON.stringify(payload)); // Hlboká kópia

    if (formattedPayload.filterModel) {
        // Jednoducho preženieme celý komplexný filter našou rekurziou
        formattedPayload.filterModel = fixAgGridDateFilters(formattedPayload.filterModel);
    }

    return formattedPayload;
};

const mapResponse = (response: AxiosResponse<RevisionsSearchPage>): RevisionsSearchPage => {
  if (response.data?.rowData) {
    response.data.rowData = response.data.rowData.map(item => ({
      ...item,
      // Ak existuje, preklopí na Date, inak nechá undefined
      revisionDate: item.revisionDate ? new Date(item.revisionDate) : undefined
    }));
  }
  return response.data;
};

export const searchDocumentRevisions = async (
  payload: RevisionsSearchPageableRequest,
  jwtToken: string
): Promise<RevisionsSearchPage> => {

  const response = await axios.post<RevisionsSearchPage>(
    '/v2/documents/revisions/search',
    formatOutgoingPayload(payload),
    { headers: getHeaders(jwtToken) }
  );

  return mapResponse(response);
};

export const searchDocumentRevisionsAdvanced = async (
  payload: RevisionsSearchPageableRequest,
  jwtToken: string
): Promise<RevisionsSearchPage> => {

  const response = await axios.post<RevisionsSearchPage>(
    '/v2/documents/revisions/search/advanced',
    formatOutgoingPayload(payload),
    { headers: getHeaders(jwtToken) }
  );

  return mapResponse(response);
};

