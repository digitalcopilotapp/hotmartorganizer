import * as brevo from '@getbrevo/brevo';
import { config } from '../config/env.js';

export class BrevoService {
  private apiInstance: brevo.ContactsApi;
  private dealsApiInstance: brevo.DealsApi;
  private notesApiInstance: brevo.NotesApi;

  constructor() {
    this.apiInstance = new brevo.ContactsApi();
    this.dealsApiInstance = new brevo.DealsApi();
    this.notesApiInstance = new brevo.NotesApi();
    
    // Configure API key authorization
    this.apiInstance.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey);
    this.dealsApiInstance.setApiKey(brevo.DealsApiApiKeys.apiKey, config.brevoApiKey);
    this.notesApiInstance.setApiKey(brevo.NotesApiApiKeys.apiKey, config.brevoApiKey);
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

  /**
   * Adiciona uma nota a um contato (CRM)
   */
  async addNoteToContact(email: string, text: string): Promise<any> {
      try {
          const contact = await this.getContact(email);
          if (!contact || !contact.id) {
              console.warn(`Cannot add note: Contact ${email} not found.`);
              return null;
          }

          const noteData = new brevo.NoteData();
          noteData.text = text;
          noteData.contactIds = [contact.id];

          const data = await this.notesApiInstance.crmNotesPost(noteData);
          console.log('Note added successfully:', data.body);
          return data.body;
      } catch (error: any) {
          console.error('Error adding note to Brevo:', error.body || error.message);
          // Don't throw, just log, as this is secondary
          return null;
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
