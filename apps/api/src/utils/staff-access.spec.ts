import { staffRouteAllowed } from './staff-access';
import { RolesGuard } from '../guards/roles.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
describe('Staff endpoint restrictions',()=>{
  it('keeps role defaults for unscoped users and denies unlisted routes in scoped mode',()=>{
    expect(staffRouteAllowed(false,[],'GET','/inventory')).toBe(true);
    expect(staffRouteAllowed(true,[],'GET','/inventory')).toBe(false);
  });
  it('applies deny-overrides-allow and ignores expired grants',()=>{
    const rules=[{method:'*',path:'/hr/*',effect:'ALLOW'},{method:'GET',path:'/hr/payroll',effect:'DENY'}];
    expect(staffRouteAllowed(true,rules,'GET','/hr/payroll')).toBe(false);
    expect(staffRouteAllowed(true,rules,'GET','/hr/staff')).toBe(true);
    expect(staffRouteAllowed(true,[{method:'GET',path:'/hr/staff',effect:'ALLOW',expiresAt:new Date(0)}],'GET','/hr/staff')).toBe(false);
  });
  it('does not match unrelated prefix names and maps HEAD to GET',()=>{
    const rules=[{method:'GET',path:'/hr/*',effect:'ALLOW'}];
    expect(staffRouteAllowed(true,rules,'GET','/hr-private')).toBe(false);
    expect(staffRouteAllowed(true,rules,'HEAD','/hr/staff')).toBe(true);
  });
  it('cannot elevate a viewer to a write endpoint even when a rule says allow',()=>{
    const guard=new RolesGuard({getAllAndOverride:(key:string)=>key===IS_PUBLIC_KEY?false:undefined} as any);
    const context={getHandler:()=>()=>{},getClass:()=>class{},switchToHttp:()=>({getRequest:()=>({method:'POST',route:{path:'/inventory'},user:{role:'VIEWER',scopedAccess:true,accessRules:[{method:'POST',path:'/inventory',effect:'ALLOW'}]}})})};
    expect(()=>guard.canActivate(context as any)).toThrow('required role');
  });
  it('continues to enforce the installation role ceiling before route rules',()=>{
    const guard=new RolesGuard({getAllAndOverride:()=>undefined} as any);
    const context={getHandler:()=>()=>{},getClass:()=>class{},switchToHttp:()=>({getRequest:()=>({method:'POST',route:{path:'/inventory'},installationLicence:{roles:['VIEWER']},user:{role:'MODIFIER',scopedAccess:true,accessRules:[{method:'POST',path:'/inventory',effect:'ALLOW'}]}})})};
    expect(()=>guard.canActivate(context as any)).toThrow('installation licence');
  });
});
