import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: true })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(
    passwordConfirm: string,
    args: ValidationArguments,
  ): Promise<boolean> | boolean {
    const data = (args.object as any)[args.constraints[0]];

    if (passwordConfirm === data) {
      return true;
    } else {
      return false;
    }
  }
  defaultMessage(): string {
    return 'Las contraseñas no coinciden';
  }
}
