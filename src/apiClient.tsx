import axios, { type AxiosResponse } from 'axios';
import type { RevisionsSearchPage, RevisionsSearchPageableRequest } from './types';

const getHeaders = (jwtToken: string) => ({
  'X-Correlation-Id': crypto.randomUUID(),
  'Authorization': jwtToken
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
      // Regulárny výraz hľadá presne formát "YYYY-MM-DD HH:mm:ss" ALEBO "YYYY-MM-DDTHH:mm:ss"
      // \d{4} znamená 4 číslice, [ T] znamená medzeru alebo písmeno T
      const dateRegex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;

      if (typeof value === 'string' && dateRegex.test(value)) {
        // Ak bola v texte medzera (Basic filter), nahradí ju za T.
        // Ak tam už bolo T (Advanced filter), replace nič neurobí.
        // Následne na koniec prilepí Z.
        value = value.replace(' ', 'T') + 'Z';
      }

      // Zavoláme rekurziu pre prípad, že vo vnútri sú ďalšie vnorené podmienky
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

export const getRevisionStatusEnums = async (

): Promise<string[]> => {

  return [ "HISTORIE","STAV_ZAZNAM", "NAHRAZENA", "SCHVALOVANA" ];
}
