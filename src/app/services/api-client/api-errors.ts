// TODO: Add all error codes possibly receivable from API
export enum ApiErrorCode {
  API_FORBIDDEN = 0,
  API_UPLOAD_FAILED,
  API_UPLOAD_TOO_LARGE,
  USER_NOT_FOUND = 100,
  HIDEOUT_NOT_FOUND = 200,
}

// TODO: Make a proper map between error codes and error messages
export function getApiErrorMsg(errorCode?: ApiErrorCode) {
  switch (errorCode) {
    case ApiErrorCode.API_FORBIDDEN:
      return 'Unauthorized operation';
    case ApiErrorCode.USER_NOT_FOUND:
      return "Couldn't find user";
    case ApiErrorCode.HIDEOUT_NOT_FOUND:
      return "Couldn't find hideout";
    default:
      return 'An unexpected error happened';
  }
}
