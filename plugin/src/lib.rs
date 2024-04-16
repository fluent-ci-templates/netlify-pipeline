use std::vec;

use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            "+nodejs.org",
            "+bun.sh",
            "+git",
            "bunx",
            "netlify-cli status && bunx netlify-cli deploy ",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
