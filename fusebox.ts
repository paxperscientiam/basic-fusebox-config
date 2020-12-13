import { fusebox, sparky } from 'fuse-box';
import { tsc } from 'fuse-box/sparky/tsc'
import {pluginTypeChecker} from 'fuse-box-typechecker';
import { IPublicConfig } from 'fuse-box/config/IConfig';

const { spawn } = require('child_process')

import * as ts from "typescript";

const typeChecker = require('fuse-box-typechecker').TypeChecker({
    tsConfig: './tsconfig.json',
    basePath: './',
    name: 'checkerSync',
    print_summary: true,
});

class Context {
    public outputType!: string
    public config: IPublicConfig = {}

    constructor() {
        this.config = {
            logging: {
                level: 'verbose',
            },
            target: 'browser',
            entry: 'src/index.ts',
            webIndex: {
                template: 'src/index.html',
            },
            devServer: {
                hmrServer: {
                    enabled: true,
                },
            },
            cache: false,
            hmr: true,
            plugins: [],


        }

    }

    public extendConfig(config: IPublicConfig) {
        this.config = {
            ...this.config,
            ...config,
        }
    }

    public getConfig() {
            this.config.plugins.push(pluginTypeChecker({
                name: 'Superman',
            }))
        // const plugins = []
        // const isESM = "esm" == this.outputType
        // const isCJS = "cjs" == this.outputType
        // if(!isProduction) {

        // }

        // const config: IPublicConfig = {
        //     logging: {
        //         level: 'verbose',
        //     },

        //     target: 'browser',
        //     entry: isProduction ? 'src/index.ts' : 'src/test.ts',
        //     webIndex: !isProduction && {
        //         template: 'src/index.html',
        //     },
        //     devServer: !isProduction && {
        //         hmrServer: {
        //             enabled: true,
        //         },
        //     },
        //     cache: false,
        //     modules: ["a","b"],
        //     "hmr": !isProduction,
        //     plugins,
        // }

        // if (isESM) {
        //     console.log("ESM")
        //     config.compilerOptions = {
        //         tsConfig: "./tsconfig.json"
        //     }
        // }

        // if (isCJS) {
        //     console.log("CJS")
        //     config.compilerOptions = {
        //         tsConfig: "./tsconfig-cjs.json"
        //     }
        // }

        return fusebox(this.config)
    }
}


const {
    rm,
    task,
    exec,
} = sparky<Context>(Context)

task("generate-definition", async () => {
    spawn('tsc', ['--emitDeclarationOnly', '--outDir', './@types/app']);
})

task("default", async (ctx: Context) => {
    ctx.extendConfig({
        hmr: false,
    })
    const fuse = ctx.getConfig()
    await fuse.runDev({
        bundles: {
            distRoot: "./lib/cjs",
            app: 'index.js',
        },
    })
})

task("build", async (ctx: Context) => {
    rm("./lib")

    exec("generate-definition")

    ctx.extendConfig({
        webIndex: false,
        devServer: false,
    })

    await ctx.getConfig().runProd({
        manifest: false,
        bundles: {
            distRoot: "./lib/esm",
            app: 'index.js',
        },
        buildTarget: "ES2015",

    })
        .then(function() {
            console.log("Done building ESM module")
        })

    ctx.extendConfig({
        compilerOptions: {
            tsConfig: "./tsconfig-cjs.json",
        }
    })

    await ctx.getConfig().runProd({
        manifest: false,
        bundles: {
            distRoot: "./lib/cjs",
            app: 'index.js',
        },
        buildTarget: "ES2015",
    })
        .then(function() {
            console.log("Done building commonjs module")
        })
})

// task("default", async (ctx: Context) => {
//     ctx.outputType = "esm"
//     const fuse = ctx.getConfig(false)
//     await fuse.runDev({
//         manifest: false,
//         bundles: {
//             distRoot: "./lib/esm",
//             app: 'index.js',
//         },
//     })
//     // ctx.outputType = 'cjs'
//     // const fuse = ctx.getConfig(true)
//     // rm('./lib/cjs/*')

//     // await fuse.runDev({
//     //     bundles: {
//     //         distRoot: "./lib/cjs",
//     //         app: 'index.js',
//     //     },
//     // })
// })

// task('typecheck', () => {
//     typeChecker.printSettings();
//     typeChecker.inspectAndPrint();
//     typeChecker.worker_watch('./src');
// });

// task("build:esm", async (ctx: Context) => {
//     ctx.outputType = "esm"
//     const fuse = ctx.getConfig(true)
//     rm('./lib/esm/*')
//     await fuse.runProd({
//         manifest: false,
//         bundles: {
//             distRoot: "./lib/esm",
//             app: 'index.js',
//         },
//     })
//         .then(function() {
//             console.log("Done building ESM module")
//         })

// })

// task("build:cjs", async (ctx: Context) => {
//     ctx.outputType = 'cjs'
//     const fuse = ctx.getConfig(true)
//     rm('./lib/cjs/*')

//     await fuse.runProd({
//         manifest: false,
//         bundles: {
//             distRoot: "./lib/cjs",
//             app: 'index.js',
//         },
//     })
//         .then(function() {
//             console.log("Done building commonjs module")
//         })
// })



// task("build", async (ctx: Context) => {
//     rm('./lib/*')
//     rm('./@types/app/*')
// //    await exec("generate-definition")
//     await exec("build:cjs")
//     await exec("build:esm")
// })

// // 6936
