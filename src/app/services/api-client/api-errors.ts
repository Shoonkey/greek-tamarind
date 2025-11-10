// Notes:
// - Add all error codes possibly receivable from API
// - Map between error codes and error messages

export enum ApiErrorCode {
  API_FORBIDDEN = 0,
  API_UPLOAD_FAILED,
  API_UPLOAD_TOO_LARGE,
  API_ROUTE_NOT_FOUND,
  USER_NOT_FOUND = 100,
  HIDEOUT_NOT_FOUND = 200,
}

export function getApiErrorMsg(errorCode?: ApiErrorCode) {
  switch (errorCode) {
    case ApiErrorCode.API_FORBIDDEN:
      return 'Unauthorized operation';
    case ApiErrorCode.API_UPLOAD_FAILED:
      return "Couldn't finish uploading file";
    case ApiErrorCode.API_UPLOAD_TOO_LARGE:
      return "Couldn't upload because the file is too large";
    case ApiErrorCode.API_ROUTE_NOT_FOUND:
      return "Couldn't find route";
    case ApiErrorCode.USER_NOT_FOUND:
      return "Couldn't find user";
    case ApiErrorCode.HIDEOUT_NOT_FOUND:
      return "Couldn't find hideout";
    default:
      return 'An unexpected error happened on our end';
  }
}
