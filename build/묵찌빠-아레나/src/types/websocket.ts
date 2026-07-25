export type WebSocketEvent = 
  // Matchmaking
  | 'matchmaking:start'
  | 'matchmaking:cancel'
  | 'matchmaking:matched'
  
  // Game Flow
  | 'game:ready'
  | 'game:start'
  | 'game:select'
  | 'game:selectionLocked'
  | 'game:roundResult'
  | 'game:attackChanged'
  | 'game:finish'
  
  // Connection & Errors
  | 'game:reconnect'
  | 'game:opponentDisconnected'
  | 'game:invalid'
  
  // Rematch
  | 'rematch:request'
  | 'rematch:accept'
  | 'rematch:reject';

export interface WebSocketPayload {
  type: WebSocketEvent;
  payload: any;
  timestamp: string;
}
