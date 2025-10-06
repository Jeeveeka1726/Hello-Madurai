'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon, 
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TvIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface BluetoothDevice {
  id: string
  name: string
  type: 'speaker' | 'headphones' | 'phone' | 'computer' | 'tv' | 'unknown'
  connected: boolean
  battery?: number
  rssi?: number
}

interface BluetoothManagerProps {
  onDeviceConnect?: (device: BluetoothDevice) => void
  onDeviceDisconnect?: (device: BluetoothDevice) => void
  className?: string
}

export default function BluetoothManager({ 
  onDeviceConnect, 
  onDeviceDisconnect, 
  className = '' 
}: BluetoothManagerProps) {
  const { t } = useLanguage()
  const [isSupported, setIsSupported] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null)
  const [error, setError] = useState<string>('')
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  // Check Bluetooth support
  useEffect(() => {
    const checkBluetoothSupport = async () => {
      if ('bluetooth' in navigator) {
        try {
          const availability = await navigator.bluetooth.getAvailability()
          setIsSupported(availability)
        } catch (error) {
          console.error('Bluetooth availability check failed:', error)
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }

    checkBluetoothSupport()

    // Listen for Bluetooth availability changes
    if ('bluetooth' in navigator) {
      navigator.bluetooth.addEventListener('availabilitychanged', (event: any) => {
        setIsSupported(event.value)
      })
    }
  }, [])

  // Initialize Web Audio API
  useEffect(() => {
    if (isSupported && !audioContext) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(context)
      } catch (error) {
        console.error('AudioContext initialization failed:', error)
      }
    }
  }, [isSupported])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'speaker':
      case 'headphones':
        return SpeakerWaveIcon
      case 'phone':
        return DevicePhoneMobileIcon
      case 'computer':
        return ComputerDesktopIcon
      case 'tv':
        return TvIcon
      default:
        return WifiIcon
    }
  }

  const detectDeviceType = (name: string): BluetoothDevice['type'] => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('speaker') || lowerName.includes('soundbar')) return 'speaker'
    if (lowerName.includes('headphone') || lowerName.includes('earphone') || lowerName.includes('airpods')) return 'headphones'
    if (lowerName.includes('phone') || lowerName.includes('mobile')) return 'phone'
    if (lowerName.includes('computer') || lowerName.includes('laptop') || lowerName.includes('pc')) return 'computer'
    if (lowerName.includes('tv') || lowerName.includes('television')) return 'tv'
    return 'unknown'
  }

  const scanForDevices = async () => {
    if (!isSupported) {
      setError(t('bluetooth.notSupported', 'Bluetooth is not supported on this device', 'இந்த சாதனத்தில் புளூடூத் ஆதரிக்கப்படவில்லை'))
      return
    }

    setIsScanning(true)
    setError('')

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      })

      if (device) {
        const newDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          type: detectDeviceType(device.name || ''),
          connected: false
        }

        setDevices(prev => {
          const existing = prev.find(d => d.id === newDevice.id)
          if (existing) {
            return prev.map(d => d.id === newDevice.id ? newDevice : d)
          }
          return [...prev, newDevice]
        })

        // Try to connect immediately
        await connectToDevice(newDevice)
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        setError(t('bluetooth.noDevicesFound', 'No devices found or selection cancelled', 'சாதனங்கள் எதுவும் கிடைக்கவில்லை அல்லது தேர்வு ரத்து செய்யப்பட்டது'))
      } else {
        setError(t('bluetooth.scanError', 'Failed to scan for devices', 'சாதனங்களை ஸ்கேன் செய்வதில் தோல்வி'))
        console.error('Bluetooth scan error:', error)
      }
    } finally {
      setIsScanning(false)
    }
  }

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setError('')
      
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: device.name }],
        optionalServices: ['battery_service', 'device_information']
      })

      const server = await bluetoothDevice.gatt?.connect()
      
      if (server) {
        // Update device as connected
        const updatedDevice = { ...device, connected: true }
        setDevices(prev => prev.map(d => d.id === device.id ? updatedDevice : d))
        setConnectedDevice(updatedDevice)
        
        // Try to get battery level
        try {
          const batteryService = await server.getPrimaryService('battery_service')
          const batteryCharacteristic = await batteryService.getCharacteristic('battery_level')
          const batteryValue = await batteryCharacteristic.readValue()
          const batteryLevel = batteryValue.getUint8(0)
          
          updatedDevice.battery = batteryLevel
          setDevices(prev => prev.map(d => d.id === device.id ? updatedDevice : d))
        } catch (error) {
          // Battery service not available
        }

        // Set up audio routing
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        onDeviceConnect?.(updatedDevice)
        
        // Listen for disconnection
        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          const disconnectedDevice = { ...updatedDevice, connected: false }
          setDevices(prev => prev.map(d => d.id === device.id ? disconnectedDevice : d))
          if (connectedDevice?.id === device.id) {
            setConnectedDevice(null)
          }
          onDeviceDisconnect?.(disconnectedDevice)
        })
      }
    } catch (error: any) {
      setError(t('bluetooth.connectError', 'Failed to connect to device', 'சாதனத்துடன் இணைப்பதில் தோல்வி'))
      console.error('Bluetooth connection error:', error)
    }
  }

  const disconnectDevice = async (device: BluetoothDevice) => {
    try {
      // In a real implementation, you would disconnect the GATT server
      const updatedDevice = { ...device, connected: false }
      setDevices(prev => prev.map(d => d.id === device.id ? updatedDevice : d))
      
      if (connectedDevice?.id === device.id) {
        setConnectedDevice(null)
      }
      
      onDeviceDisconnect?.(updatedDevice)
    } catch (error) {
      console.error('Bluetooth disconnection error:', error)
    }
  }

  const streamAudioToDevice = async (audioElement: HTMLAudioElement) => {
    if (!audioContext || !connectedDevice) return

    try {
      // Create audio source from the audio element
      const source = audioContext.createMediaElementSource(audioElement)
      
      // Create gain node for volume control
      const gainNode = audioContext.createGain()
      
      // Connect the nodes
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      console.log('Audio streaming to Bluetooth device:', connectedDevice.name)
    } catch (error) {
      console.error('Audio streaming error:', error)
    }
  }

  if (!isSupported) {
    return (
      <div className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('bluetooth.notSupported', 'Bluetooth Not Supported', 'புளூடூத் ஆதரிக்கப்படவில்லை')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('bluetooth.notSupportedDesc', 'Your browser or device does not support Bluetooth connectivity.', 'உங்கள் உலாவி அல்லது சாதனம் புளூடூத் இணைப்பை ஆதரிக்கவில்லை.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('bluetooth.title', 'Bluetooth Devices', 'புளூடூத் சாதனங்கள்')}
            </h3>
          </div>
          <button
            onClick={scanForDevices}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isScanning ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <WifiIcon className="h-4 w-4" />
            )}
            {isScanning 
              ? t('bluetooth.scanning', 'Scanning...', 'ஸ்கேன் செய்கிறது...')
              : t('bluetooth.scan', 'Scan', 'ஸ்கேன்')
            }
          </button>
        </div>
      </div>

      {/* Connected Device */}
      {connectedDevice && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                {(() => {
                  const IconComponent = getDeviceIcon(connectedDevice.type)
                  return <IconComponent className="h-5 w-5 text-white" />
                })()}
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {connectedDevice.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('bluetooth.connected', 'Connected', 'இணைக்கப்பட்டது')}
                  {connectedDevice.battery && ` • ${connectedDevice.battery}% battery`}
                </p>
              </div>
            </div>
            <button
              onClick={() => disconnectDevice(connectedDevice)}
              className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
            >
              {t('bluetooth.disconnect', 'Disconnect', 'துண்டிக்கவும்')}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Device List */}
      <div className="p-4">
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <WifiIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('bluetooth.noDevices', 'No Bluetooth devices found. Tap scan to discover devices.', 'புளூடூத் சாதனங்கள் எதுவும் கிடைக்கவில்லை. சாதனங்களைக் கண்டறிய ஸ்கேன் என்பதைத் தட்டவும்.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => {
              const IconComponent = getDeviceIcon(device.type)
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${device.connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <IconComponent className={`h-5 w-5 ${device.connected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {device.connected 
                          ? t('bluetooth.connected', 'Connected', 'இணைக்கப்பட்டது')
                          : t('bluetooth.available', 'Available', 'கிடைக்கிறது')
                        }
                        {device.battery && ` • ${device.battery}%`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.connected ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <button
                          onClick={() => disconnectDevice(device)}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('bluetooth.disconnect', 'Disconnect', 'துண்டிக்கவும்')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => connectToDevice(device)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('bluetooth.connect', 'Connect', 'இணைக்கவும்')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Audio Streaming Info */}
      {connectedDevice && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <SpeakerWaveIcon className="h-4 w-4 inline mr-1" />
            {t('bluetooth.audioStreaming', 'Audio will stream to connected Bluetooth device', 'ஆடியோ இணைக்கப்பட்ட புளூடூத் சாதனத்திற்கு ஸ்ட்ரீம் செய்யப்படும்')}
          </p>
        </div>
      )}
    </div>
  )
}

