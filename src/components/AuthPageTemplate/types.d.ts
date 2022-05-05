type Fileds = "name" | "password";

export type FormDataState = Record<Fileds, string>;

export type FormErrorState = Record<Fileds, boolean>;

export interface ContainerProps {
  title: string;
  buttonText: string;
  linkText: string;
}

export type HandleInputChange = (
  field: keyof FormDataState
) => (event: ChangeEvent<HTMLInputElement>) => void;

export type HandleSubmit = (event: FormEvent<HTMLFormElement>) => void;

export type HandleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => void;
