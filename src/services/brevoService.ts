import * as brevo from '@getbrevo/brevo';
import { config } from '../config/env.js';

export class BrevoService {
  private apiInstance: brevo.ContactsApi;
  private dealsApiInstance: brevo.DealsApi;

  constructor() {
    this.apiInstance = new brevo.ContactsApi();
    this.dealsApiInstance = new brevo.DealsApi();
    
    // Configure API key authorization
    this.apiInstance.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey);
    this.dealsApiInstance.setApiKey(brevo.DealsApiApiKeys.apiKey, config.brevoApiKey);
  }

  /**
   * Cria ou atualiza um contato no Brevo
   */
  async createOrUpdateContact(email: string, attributes: any, listIds: number[] = []): Promise<any> {
    const createContact = new brevo.CreateContact();
    createContact.email = email;
    createContact.attributes = attributes;
    createContact.listIds = listIds;
    createContact.updateEnabled = true;

    try {
      const data = await this.apiInstance.createContact(createContact);
      console.log('Contact created/updated successfully:', data.body);
      return data.body;
    } catch (error: any) {
      console.error('Error creating/updating contact in Brevo:', error.body || error.message);
      throw error;
    }
  }

  /**
   * Cria uma oportunidade (Deal) no CRM do Brevo
   */
  async createDeal(
    dealName: string, 
    contactEmail: string, 
    dealAmount: number, 
    pipelineId: string, 
    dealStageId: string
  ): Promise<any> {
    const dealRequest = new brevo.CrmDealsPostRequest();
    dealRequest.name = dealName;
    
    // Mapeando atributos. Nota: Os nomes das chaves de atributos dependem da configuração do seu CRM no Brevo.
    dealRequest.attributes = {
        amount: dealAmount,
        pipeline: pipelineId,
        deal_stage: dealStageId
    };

    try {
        // Busca o contato para pegar o ID interno do Brevo
        const contact = await this.getContact(contactEmail);
        
        if (contact && contact.id) {
            dealRequest.linkedContactsIds = [contact.id];
        }

        const data = await this.dealsApiInstance.crmDealsPost(dealRequest);
        console.log('Deal created successfully:', data.body);
        return data.body;
    } catch (error: any) {
        console.error('Error creating deal in Brevo:', error.body || error.message);
        throw error;
    }
  }

  async getContact(email: string): Promise<{ id: number; email?: string } | null> {
      try {
          const data = await this.apiInstance.getContactInfo(email);
          return data.body;
      } catch (error: any) {
          if (error.response && error.response.status === 404) {
              return null;
          }
          console.error('Error fetching contact:', error);
          throw error;
      }
  }
}
