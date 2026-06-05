- [x] Update `CMS.Backend/Controllers/AccountController.cs` so backend does not render Razor login; redirect to frontend `/login`.
- [ ] Ensure Admin/Editor login/logout still works (redirect to admin `/Home/Index` rather than frontend).
- [ ] Keep logout working: admin logout should go to backend login handler, which then redirects appropriately.
- [ ] Retest: open `/Account/Login` in browser before/after login; verify correct UI.


