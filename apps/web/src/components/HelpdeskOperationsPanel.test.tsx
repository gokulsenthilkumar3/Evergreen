import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../utils/api';
import HelpdeskOperationsPanel from './HelpdeskOperationsPanel';
vi.mock('../utils/api',()=>({default:{get:vi.fn(),post:vi.fn()}}));
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();window.history.replaceState(null,'','/helpdesk');vi.mocked(api.get).mockImplementation(async url=>({data:String(url).endsWith('/capabilities')?{antivirus:{state:'CLEAN'},signedEventIntake:[]}:[]}));vi.mocked(api.post).mockResolvedValue({data:{}});});afterEach(cleanup);
const mount=(role:string)=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><HelpdeskOperationsPanel username="staff" role={role} onView={()=>{}} onTicket={()=>{}}/></QueryClientProvider>);
describe('Helpdesk configuration forms',()=>{
 it('creates a queue through named fields and submits an audited initial version',async()=>{
  mount('ADMIN');fireEvent.click(screen.getByRole('tab',{name:'Configuration'}));fireEvent.click(await screen.findByRole('button',{name:'Create'}));
  fireEvent.change(screen.getByRole('textbox',{name:/Configuration key/}),{target:{value:'REPAIRS'}});fireEvent.change(screen.getByRole('textbox',{name:/Title/}),{target:{value:'Printer repairs'}});fireEvent.change(screen.getByRole('textbox',{name:/Reason for this revision/}),{target:{value:'Create a queue for printer support'}});fireEvent.click(screen.getByRole('button',{name:'Save revision'}));
  await waitFor(()=>expect(api.post).toHaveBeenCalledWith('/helpdesk/resources',expect.objectContaining({kind:'QUEUE',key:'REPAIRS',visibility:'PUBLIC',status:'ACTIVE',version:0,data:{members:[],capacity:20,routing:'MANUAL'}})));
 });
 it('keeps staff saved views private and preserves the ALL filter values',async()=>{
  mount('VIEWER');fireEvent.click(screen.getByRole('tab',{name:'Saved views'}));fireEvent.click(screen.getByRole('button',{name:'Create saved view'}));
  fireEvent.change(screen.getByRole('textbox',{name:/Configuration key/}),{target:{value:'my-view'}});fireEvent.change(screen.getByRole('textbox',{name:/Title/}),{target:{value:'My invoice requests'}});fireEvent.change(screen.getByRole('textbox',{name:'Search text'}),{target:{value:'invoice'}});fireEvent.change(screen.getByRole('textbox',{name:/Reason for this revision/}),{target:{value:'Keep my support search private'}});fireEvent.click(screen.getByRole('button',{name:'Save revision'}));
  await waitFor(()=>expect(api.post).toHaveBeenCalledWith('/helpdesk/resources',expect.objectContaining({kind:'VIEW',visibility:'PRIVATE',data:expect.objectContaining({q:'invoice',status:'ALL',priority:'ALL',assignment:'ALL'})})));
 });
});
