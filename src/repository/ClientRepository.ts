import { ADD_CONFIRMATION_QUERY, ADD_MANAGER_QUERY, DELETE_CLIENT_QUERY, GET_QUERY, INSERT_CLIENT_QUERY, UPDATE_CARD_QUERY } from "../helper/queries";
import IUserDetail from "interfaces/IUserDetail";
import pool from "../db/connection";

class ClientRepository {
  private connection = pool.connect();
  create = async (client: IUserDetail) => {
    try {
      const connection = await this.connection;
      connection.query(INSERT_CLIENT_QUERY, [
        client.token,
        client.firstname,
        client.lastname,
        client.card,
        client.cvv,
        client.expiry_date,
        client.price,
        client.address,
        client.phone,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  get = async (token: string): Promise<IUserDetail | undefined> => {
    try {
      const connection = await this.connection;
      const result = (await connection.query<IUserDetail>(GET_QUERY, [token])).rows[0];
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  addManager = async (token: string, managerId: string) => {
    try {
      const connection = await this.connection;
      connection.query(ADD_MANAGER_QUERY, [token, managerId]);
    } catch (err) {
      console.log(err);
      
    }
  }

  addConfirmation = async (token: string, confirm: string, value: string) => {
    try {
      const connection = await this.connection;
      connection.query(ADD_CONFIRMATION_QUERY, [token, confirm, value]);
    } catch (err) {
      console.log(err);
      
    }
  }

  updateCard = async (token: string, card: string, cvv: string, expiry_date: string) => {
    try {
      const connection = await this.connection;
      connection.query(UPDATE_CARD_QUERY, [token, card, cvv, expiry_date]);
    } catch (err) {
      console.log(err);
    }
  }
  
  delete = async (token: string) => {
    try {
      const connection = await this.connection;
      connection.query(DELETE_CLIENT_QUERY, [token]);
    } catch (err) {
      console.log(err);
    }
  }
}

export default ClientRepository;
