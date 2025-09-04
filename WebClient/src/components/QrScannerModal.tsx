import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import Modal from './Modal';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const qrScanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = qrScanner;

      const handleSuccess = (decodedText: string) => {
        onScanSuccess(decodedText);
      };

      const handleError = (errorMessage: string) => {
        // console.warn(`QR Error: ${errorMessage}`);
      };

      qrScanner.start({ facingMode: 'environment' }, config, handleSuccess, handleError)
        .catch(err => console.error("Unable to start scanning.", err));

    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner.", err));
      }
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup.", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escanear QR Code do Item">
      <div id="qr-reader-container" style={{ width: '100%' }}></div>
    </Modal>
  );
};

export default QrScannerModal;
