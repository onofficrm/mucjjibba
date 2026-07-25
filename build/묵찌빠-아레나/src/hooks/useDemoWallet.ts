import { useEffect, useState } from 'react';
import { loadDemoWallet, subscribeDemoWallet, type DemoWallet } from '@/utils/demoWallet';

export function useDemoWallet(): DemoWallet {
  const [wallet, setWallet] = useState<DemoWallet>(() => loadDemoWallet());

  useEffect(() => {
    setWallet(loadDemoWallet());
    return subscribeDemoWallet(setWallet);
  }, []);

  return wallet;
}
