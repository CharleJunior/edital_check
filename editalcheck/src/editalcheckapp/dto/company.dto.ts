

export class loginDto {
  readonly email: string;
  readonly password: string;
}

export class companySignupDto {
  readonly email: string;
  readonly cnpj: string;
  readonly address: string;
  readonly razaoSocial: string;
  readonly certidoes: string;
  readonly porte: string;
  readonly phone: string;
}

export class companyDocDto {
  readonly tipoDocumento: string;
  readonly categoriaDocumento: string;
  readonly versaoDocumento: string;
  readonly validadeDocumento: string;
}

export class companyAtestadosDto {
  readonly tipoServico: string;
  readonly escopo: string;
  readonly quantidadeComprovada: number;
  readonly valor: number;
  readonly unidade: string;
  readonly periodoMeses: number;
  readonly complexidade: string;
  readonly contratante: string;
  readonly atividadesRealizadas: string;

}