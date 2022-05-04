export interface ContainerProps {
  title: string;
  buttonText: string;
  linkText: string;
  linkHref: string;
}

export interface FormDataState {
  name: string;
  password: string;
}

export type HandleInputChange = (
  field: keyof FormDataState
) => (event: ChangeEvent<HTMLInputElement>) => void;

export type HandleSubmit = (event: FormEvent<HTMLFormElement>) => void;
