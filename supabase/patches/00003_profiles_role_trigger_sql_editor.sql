-- Daha önce 00003'ü çalıştırdıysanız ve SQL Editor'den rol atarken ROL_DEGISIMI_YETKISIZ alıyorsanız
-- bu fonksiyonu bir kez çalıştırın (JWT yokken bakım yoluna izin).

create or replace function public.profiles_block_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception 'ROL_DEGISIMI_YETKISIZ'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
