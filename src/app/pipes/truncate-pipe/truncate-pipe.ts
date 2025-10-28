import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxChars: number, overflowSuffix: string = '...'): string {
    if (maxChars <= 0) throw new Error("maxChars can't be smaller or equal to 0");

    if (overflowSuffix.length >= maxChars)
      throw new Error("overflowSuffix can't be bigger than maxChars");

    if (value.length <= maxChars) return value;

    return value.substring(0, maxChars - overflowSuffix.length) + overflowSuffix;
  }
}
