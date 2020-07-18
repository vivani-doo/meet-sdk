export  class TokenInfo {

    public value: string;

    public expireAt: number;
}

export class ConfigurationItem {

    public key: string;

    public value: string;
}

export class HostInfo {
    
    /**
     * Origin of the frame which post messages will be processed.
     * 
     * @type {string}
     * @memberof DevInitContext
     */
    public origin: string;

   /**
     * Address of the host of the api addons is calling to validate the token etc
     *
     * @type {string}
     * @memberof HostInfo
     */
    public authHost: string;
}

/**
 * Non session specific participant info.
 *
 * @export
 * @class ParticipantUserInfo
 */
export class ParticipantUserInfo {

    /**
     * Url of the participant avatar (if any).
     * Avatar can be undefined if user has no avatar or 
     * choose in user privacy settings not to share it with addons.
     * 
     * @type {string}
     * @memberof ParticipantInfo
     */
    public avatarUrl?: string;

    /**
     * Display name of the participant (if any).
     *
     * Display name can be undefined if user choose in 
     * user privacy settings to not share it with addons.
     * @type {string}
     * @memberof ParticipantInfo
     */
    public displayName?: string;

   /**
    * Color assigned to a principal user.
    * The color can be used by the application for personalizing
    * user specific UX elements.
    *
    * @type {string}
    * @memberof PrincipalInfo
    */
   public color: string;
   
   /**
    * Gets or sets information if participant is a guest user. 
    *
    * @type {boolean}
    * @memberof ParticipantUserInfo
    */
   public isGuest: boolean;

    /**
     * Requested theme of the addon UI.
     * Default is dark theme. 
     * 
     * @type {('dark' | 'light')}
     * @memberof InitMessage
     */
    public theme: 'dark' | 'light' = 'dark';
}

export class ParticipantInfo extends ParticipantUserInfo {
    
    /**
     * Identifier of the addon for which the 
     * hashed participant info is valid for 
     *
     * @type {string}
     * @memberof ParticipantInfo
     */
    public addonIdentifier: string;

    /**
     * Addon specific meeting identifier hash
     *
     * @type {string}
     * @memberof ParticipantInfo
     */
    public sessionId: string;

    /**
     * Addon specific meeting participant identifier hash
     *
     * @type {string}
     * @memberof ParticipantInfo
     */
    public sessionUserId: string;

    /**
     * A role participant has in the meeting.
     *
     * @type {string}
     * @memberof ParticipantInfo
     */
    public sessionUserRole: string;
}

export class PrincipalInfo extends ParticipantInfo {
    
   /**
    * Token which addon host can use to verify the authenticity of the initialization message and which 
    * will be sent as bearer authorization header to the meet addon API service providing context synchronization
    * and storage.
    * Token information contains both the token value and Unix based timestamp of when the token value will expire.
    *
    * @type {TokenInfo}
    * @memberof PrincipalInfo
    */
   public token: TokenInfo;

   /**
    * Hashed tenant identifier.
    * If default tenant, this value is null
    *
    * @type {string}
    * @memberof PrincipalInfo
    */
   public tenant: string;
}
