import { useState, useEffect } from 'react';
import { initBlockchain, createReportOnChain, upvoteReportOnChain, getReportFromChain, getUserCredits, getSignerAddress } from '../blockchain/contract';

// Hook for blockchain integration
export const useBlockchain = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = async () => {
      try {
        await initBlockchain();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to blockchain:', error);
      }
    };
    connect();
  }, []);

  const createReport = async (ipfsHash: string, lat: number, lon: number) => {
    if (!isConnected) return;
    try {
      const tx = await createReportOnChain(ipfsHash, lat, lon);
      console.log('Report created on-chain:', tx);
      return tx;
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const upvoteReport = async (reportId: number) => {
    if (!isConnected) return;
    try {
      const tx = await upvoteReportOnChain(reportId);
      console.log('Report upvoted on-chain:', tx);
      return tx;
    } catch (error) {
      console.error('Error upvoting report:', error);
    }
  };

  const fetchReport = async (reportId: number) => {
    if (!isConnected) return null;
    try {
      return await getReportFromChain(reportId);
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  };

  const fetchCredits = async () => {
    if (!isConnected) return 0;
    try {
      const address = await getSignerAddress();
      return await getUserCredits(address);
    } catch (error) {
      console.error('Error fetching credits:', error);
      return 0;
    }
  };

  return {
    isConnected,
    createReport,
    upvoteReport,
    fetchReport,
    fetchCredits
  };
};