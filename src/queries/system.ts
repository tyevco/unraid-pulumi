import { gql } from "../graphqlClient";

export const GET_SYSTEM_INFO = gql`
  query GetSystemInfo {
    info {
      os {
        hostname
        platform
        version
        uptime
      }
      cpu {
        manufacturer
        brand
        cores
        threads
      }
      memory {
        total
        layouts {
          size
          type
          clockSpeed
        }
      }
      baseboard {
        manufacturer
        model
      }
      versions {
        unraid
        api
        kernel
      }
    }
  }
`;

export const GET_SHARES = gql`
  query GetShares {
    shares {
      name
      comment
      allocator
      floor
      splitLevel
      free
      size
      used
      cachePool
      useCache
      color
    }
  }
`;

export const GET_DISKS = gql`
  query GetDisks {
    disks {
      id
      name
      device
      type
      size
      vendor
      temperature
      interfaceType
      partitions {
        name
        fsType
        size
      }
      smartStatus
    }
  }
`;

export const GET_NETWORK = gql`
  query GetNetwork {
    network {
      accessUrls {
        type
        name
        ipv4
        ipv6
      }
    }
  }
`;

export const GET_UPS_DEVICES = gql`
  query GetUPSDevices {
    upsDevices {
      id
      name
      status
      battery {
        charge
        runtime
        health
      }
      power {
        inputVoltage
        outputVoltage
        load
      }
    }
  }
`;

export const GET_UPS_CONFIGURATION = gql`
  query GetUPSConfiguration {
    upsConfiguration {
      service
      upsCable
      customUpsCable
      upsType
      device
      batteryLevel
      minutes
      timeout
      killUps
    }
  }
`;

export const CONFIGURE_UPS = gql`
  mutation ConfigureUPS($config: UPSConfigInput!) {
    configureUps(config: $config)
  }
`;

export const GET_PLUGINS = gql`
  query GetPlugins {
    plugins {
      name
      version
      author
      url
      pluginUrl
    }
  }
`;

export const ADD_PLUGIN = gql`
  mutation AddPlugin($input: PluginManagementInput!) {
    addPlugin(input: $input)
  }
`;

export const REMOVE_PLUGIN = gql`
  mutation RemovePlugin($input: PluginManagementInput!) {
    removePlugin(input: $input)
  }
`;

export const GET_CUSTOMIZATION = gql`
  query GetCustomization {
    customization {
      theme {
        name
        banner
        bannerGradient
      }
    }
  }
`;

export const SET_THEME = gql`
  mutation SetTheme($theme: ThemeName!) {
    customization {
      setTheme(theme: $theme) {
        name
        banner
        bannerGradient
      }
    }
  }
`;

export const GET_CONNECT = gql`
  query GetConnect {
    connect {
      accessType
      forwardType
      port
    }
  }
`;

export const UPDATE_CONNECT_SETTINGS = gql`
  mutation UpdateConnectSettings($input: ConnectSettingsInput!) {
    updateApiSettings(input: $input) {
      accessType
      forwardType
      port
    }
  }
`;

export const GET_RCLONE = gql`
  query GetRClone {
    rclone {
      remotes {
        name
        type
      }
    }
  }
`;

export const CREATE_RCLONE_REMOTE = gql`
  mutation CreateRCloneRemote($input: CreateRCloneRemoteInput!) {
    rclone {
      createRCloneRemote(input: $input) {
        name
        type
      }
    }
  }
`;

export const DELETE_RCLONE_REMOTE = gql`
  mutation DeleteRCloneRemote($input: DeleteRCloneRemoteInput!) {
    rclone {
      deleteRCloneRemote(input: $input)
    }
  }
`;

// --- Unified Settings ---

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      unified {
        id
        dataSchema
        uiSchema
        values
      }
      sso {
        providers {
          id
          name
          issuerUrl
          clientId
        }
      }
      api {
        version
        extraOrigins
        sandbox
        ssoSubIds
        plugins
      }
    }
  }
`;

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: JSON!) {
    updateSettings(input: $input) {
      restartRequired
      values
      warnings
    }
  }
`;

// --- System Vars ---

export const GET_VARS = gql`
  query GetVars {
    vars {
      id
      version
      name
      timeZone
      comment
      security
      workgroup
      domain
      domainShort
      hideDotFiles
      localMaster
      enableFruit
      useNtp
      ntpServer1
      ntpServer2
      ntpServer3
      ntpServer4
      sysModel
      sysArraySlots
      sysCacheSlots
      sysFlashSlots
      useSsl
      port
      portssl
      localTld
      bindMgt
      useTelnet
      porttelnet
      useSsh
      portssh
      startPage
      startArray
      spindownDelay
      queueDepth
      spinupGroups
      defaultFormat
      defaultFsType
      shutdownTimeout
      shareDisk
      shareUser
      shareUserInclude
      shareUserExclude
      shareSmbEnabled
      shareNfsEnabled
      shareAfpEnabled
      shareInitialOwner
      shareInitialGroup
      shareCacheEnabled
      shareCacheFloor
      shareMoverSchedule
      shareMoverLogging
      shareAvahiEnabled
      shareAvahiSmbName
      shareAvahiSmbModel
      shareAvahiAfpName
      shareAvahiAfpModel
      safeMode
      startMode
      configValid
      joinStatus
      deviceCount
      flashGuid
      flashProduct
      flashVendor
      regCheck
      regTy
      regState
      regTo
      sbName
      sbVersion
      sbState
      sbClean
      sbNumDisks
      mdColor
      mdNumDisks
      mdNumDisabled
      mdNumInvalid
      mdNumMissing
      mdNumNew
      mdNumErased
      mdResync
      mdResyncAction
      mdState
      mdVersion
      cacheNumDevices
      cacheSbNumDisks
      fsState
      fsProgress
      fsCopyPrcnt
      fsNumMounted
      fsNumUnmountable
      shareCount
      shareSmbCount
      shareNfsCount
      shareAfpCount
      shareMoverActive
    }
  }
`;

// --- OIDC Provider ---

export const GET_OIDC_CONFIGURATION = gql`
  query GetOidcConfiguration {
    oidcConfiguration {
      providers {
        id
        name
        issuerUrl
        clientId
        clientSecret
        scopes
        groupClaim
        adminGroup
        allowedGroups
        autoLogin
        showOnLoginPage
        buttonLabel
        buttonColor
        buttonTextColor
        buttonIcon
      }
      allowedOrigins
    }
  }
`;

export const GET_OIDC_PROVIDER = gql`
  query GetOidcProvider($id: PrefixedID!) {
    oidcProvider(id: $id) {
      id
      name
      issuerUrl
      clientId
      clientSecret
      scopes
      groupClaim
      adminGroup
      allowedGroups
      autoLogin
      showOnLoginPage
      buttonLabel
      buttonColor
      buttonTextColor
      buttonIcon
    }
  }
`;

export const CREATE_OIDC_PROVIDER = gql`
  mutation CreateOidcProvider($input: CreateOidcProviderInput!) {
    createOidcProvider(input: $input) {
      id
      name
      issuerUrl
      clientId
      clientSecret
      scopes
      groupClaim
      adminGroup
      allowedGroups
      autoLogin
      showOnLoginPage
      buttonLabel
      buttonColor
      buttonTextColor
      buttonIcon
    }
  }
`;

export const UPDATE_OIDC_PROVIDER = gql`
  mutation UpdateOidcProvider($input: UpdateOidcProviderInput!) {
    updateOidcProvider(input: $input) {
      id
      name
      issuerUrl
      clientId
      clientSecret
      scopes
      groupClaim
      adminGroup
      allowedGroups
      autoLogin
      showOnLoginPage
      buttonLabel
      buttonColor
      buttonTextColor
      buttonIcon
    }
  }
`;

export const DELETE_OIDC_PROVIDER = gql`
  mutation DeleteOidcProvider($id: PrefixedID!) {
    deleteOidcProvider(id: $id)
  }
`;

// --- Docker Organizer ---

export const GET_DOCKER_ORGANIZER = gql`
  query GetDockerOrganizer {
    docker {
      organizer {
        folders {
          id
          name
          icon
          containers
          expanded
        }
        preferences {
          viewMode
          sortBy
          sortOrder
        }
      }
    }
  }
`;

export const CREATE_DOCKER_FOLDER = gql`
  mutation CreateDockerFolder($input: CreateDockerFolderInput!) {
    docker {
      createDockerFolder(input: $input) {
        id
        name
        icon
        containers
        expanded
      }
    }
  }
`;

export const RENAME_DOCKER_FOLDER = gql`
  mutation RenameDockerFolder($input: RenameDockerFolderInput!) {
    docker {
      renameDockerFolder(input: $input) {
        id
        name
        icon
        containers
        expanded
      }
    }
  }
`;

export const DELETE_DOCKER_FOLDER = gql`
  mutation DeleteDockerFolder($id: PrefixedID!) {
    docker {
      deleteDockerFolder(id: $id)
    }
  }
`;

export const UPDATE_DOCKER_VIEW_PREFERENCES = gql`
  mutation UpdateDockerViewPreferences($input: DockerViewPreferencesInput!) {
    docker {
      updateDockerViewPreferences(input: $input) {
        viewMode
        sortBy
        sortOrder
      }
    }
  }
`;
