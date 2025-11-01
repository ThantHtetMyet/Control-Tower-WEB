import mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.brokerUrl = 'ws://localhost:8083/mqtt'; // MQTT WebSocket connection
    this.options = {
      clientId: `control_tower_web_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };
  }

  // Connect to MQTT broker
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(this.brokerUrl, this.options);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.isConnected = true;
          resolve(this.client);
        });

        this.client.on('error', (error) => {
          console.error('MQTT connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.isConnected = false;
        });

        this.client.on('reconnect', () => {
          console.log('MQTT reconnecting...');
        });

      } catch (error) {
        console.error('Failed to create MQTT client:', error);
        reject(error);
      }
    });
  }

  // Disconnect from MQTT broker
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
    }
  }

  // Publish message to topic
  publish(topic, message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.client) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      
      this.client.publish(topic, messageString, (error) => {
        if (error) {
          console.error('Failed to publish message:', error);
          reject(error);
        } else {
          console.log(`Message published to ${topic}:`, messageString);
          resolve();
        }
      });
    });
  }

  // Subscribe to topic
  subscribe(topic, callback) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.client) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      this.client.subscribe(topic, (error) => {
        if (error) {
          console.error('Failed to subscribe to topic:', error);
          reject(error);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
          resolve();
        }
      });

      // Set up message handler
      this.client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
          try {
            const parsedMessage = JSON.parse(message.toString());
            callback(parsedMessage);
          } catch (error) {
            // If JSON parsing fails, return raw message
            callback(message.toString());
          }
        }
      });
    });
  }

  // Unsubscribe from topic
  unsubscribe(topic) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.client) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      this.client.unsubscribe(topic, (error) => {
        if (error) {
          console.error('Failed to unsubscribe from topic:', error);
          reject(error);
        } else {
          console.log(`Unsubscribed from topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  // Request PDF generation - Updated to match Python service expectations
  async requestPDFGeneration(reportId, requestedBy) {
    // Validate reportId (can be numeric or GUID string)
    if (!reportId || reportId === 'undefined' || reportId === 'null') {
      throw new Error(`Invalid report ID: ${reportId}`);
    }
    
    // Validate requestedBy parameter
    if (!requestedBy || requestedBy === 'undefined' || requestedBy === 'null') {
      throw new Error(`Invalid requested_by parameter: ${requestedBy}`);
    }
    
    // Topic format: controltower/server_pm_reportform_pdf/{job_no}
    const topic = `controltower/server_pm_reportform_pdf/${reportId}`;
    const requestId = `pdf_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`;
    
    // Updated message format as requested
    const message = {
      report_id: reportId.toString(),
      requested_by: requestedBy,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`Requesting PDF generation for report ID: ${reportId}`);
      await this.publish(topic, message);
      return requestId;
    } catch (error) {
      console.error('Failed to request PDF generation:', error);
      throw error;
    }
  }

  // Subscribe to PDF status updates - Updated to match Python service
  async subscribeToPDFStatus(reportId, callback) {
    // Validate reportId (can be numeric or GUID string)
    if (!reportId || reportId === 'undefined' || reportId === 'null') {
      throw new Error(`Invalid report ID for subscription: ${reportId}`);
    }
    
    // Topic format: controltower/server_pm_reportform_pdf_status/{job_no}
    const topic = `controltower/server_pm_reportform_pdf_status/${reportId}`;
    try {
      console.log(`Subscribing to PDF status for report ID: ${reportId}`);
      await this.subscribe(topic, callback);
    } catch (error) {
      console.error('Failed to subscribe to PDF status:', error);
      throw error;
    }
  }

  // Check connection status
  isClientConnected() {
    return this.isConnected && this.client && this.client.connected;
  }
}

// Create singleton instance
const mqttService = new MQTTService();

export default mqttService;