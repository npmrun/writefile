// Generated by dts-bundle v0.7.3

declare module '@noderun/writefile' {
    const ejs: any;
    const path: any;
    const fs: any;
    interface IFileList {
        use: boolean;
        [propsData: string]: any;
    }
    const currentPath: string;
    const configPath: any;
    const isExistConfig: any;
    function createForEach(params: IFileList): void;
    function createTemplate(fromOrigin: string, targetOrigin: string, params: IFileList): void;
}
