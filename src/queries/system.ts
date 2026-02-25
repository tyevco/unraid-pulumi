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
