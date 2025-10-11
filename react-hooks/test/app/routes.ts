import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),


    // useFetch Testing
    route("fetch-test", "routes/fetch-test.tsx"),
    route("fetch-test-api", "routes/api/fetch-test-api.tsx"),

    // useFileUploadProgress Testing
    route("file-upload-progress-test", "routes/file-upload-progress-test.tsx"),
    route("file-upload-progress-test-api", "routes/api/file-upload-progress-api.tsx"),
    route("get-cf-r2-link-api", "routes/api/get-cf-r2-link-api.tsx"),
    route("submit-form-api", "routes/api/submit-form-api.tsx"),

    // useGeolocation Testing
    route("geolocation-test", "routes/geolocation-test.tsx"),

    // useLocalStorage Testing
    route("local-storage-test", "routes/localstorage-test.tsx"),

    // useNetworkStatus Testing
    route("network-status-test", "routes/network-status-test.tsx"),

    // useUserActivity Testing
    route("user-activity-test", "routes/user-activity-test.tsx"),


] satisfies RouteConfig;
