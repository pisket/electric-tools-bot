interface IUserDetail {
  token: string;
  card: string;
  expiry_date: string;
  cvv: string;
  firstname: string;
  lastname: string;
  price: string;
  manager?: number;
  address: string;
  phone: string;
  confirmation?: string;
  confirmation_value?: string;
}

export default IUserDetail;
