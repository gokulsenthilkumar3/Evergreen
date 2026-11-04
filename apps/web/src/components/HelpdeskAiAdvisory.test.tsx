import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import api from '../utils/api';
import HelpdeskAiAdvisory from './HelpdeskAiAdvisory';
vi.mock('../utils/api',()=>({default:{get:vi.fn(),post:vi.fn()}}));afterEach(cleanup);
describe('Human-reviewed support AI',()=>{
 it('requires consent for the visible context and only inserts a draft after another human click',async()=>{
  vi.mocked(api.get).mockResolvedValue({data:{configured:true,context:'Reviewed public ticket context',truncated:false}});vi.mocked(api.post).mockResolvedValue({data:{id:'draft-1',data:{text:'Suggested support reply',operation:'DRAFT',aiGenerated:true}}});const insert=vi.fn();
  render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><HelpdeskAiAdvisory ticket={{id:'ticket',version:1}} username="owner" onChanged={async()=>{}} onInsert={insert}/></QueryClientProvider>);
  fireEvent.click(screen.getByRole('button',{name:'AI advisory tools'}));await screen.findByDisplayValue('Reviewed public ticket context');expect(screen.getByRole('button',{name:'Send reviewed context to Groq'})).toBeDisabled();expect(api.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox',{name:/I consent to send/}));fireEvent.click(screen.getByRole('button',{name:'Send reviewed context to Groq'}));await screen.findByText('Suggested support reply');expect(insert).not.toHaveBeenCalled();
  await waitFor(()=>expect(api.post).toHaveBeenCalledWith('/helpdesk/tickets/ticket/ai',expect.objectContaining({consent:true,context:'Reviewed public ticket context',version:1,operation:'DRAFT'})));fireEvent.click(screen.getByRole('button',{name:'Insert as AI-assisted reply draft'}));expect(insert).toHaveBeenCalledWith('Suggested support reply','draft-1');expect(vi.mocked(api.post).mock.calls).toHaveLength(1);
 });
});
