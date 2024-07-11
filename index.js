let userWallet;
document.getElementById("walletSubmit").onclick = function(){
    userWallet = document.getElementById("wallet").value;
    console.log(userWallet)
    if (userWallets.includes(userWallet)){
        alert("Welcome!");
    }   else{
        alert("You are not a holder")
    }
}

let userWallets = ["bc1pwghem72jqjxttmwpjukpj2s4vns3pznkynd0qf3masy9e7t63aassy508d","bc1pugkm5m3ymqxpmfh5akj8x3m4e34cuq0gkk2a4fyw9uyjy6ttmd3s07ytmh","bc1pa8apt0p0ktkfva4r6jdn63psdm96q2lyngpls8u58vjaghyyn39s7h3q9a","bc1p7amp0z7c9vwlzwmxqms5sswdrh5g655tycxya42pafz72tpzjxfqjz3f5l","bc1phas893eyd2e3tplzhwfa4qkwzp24xxlh6lwey5dcw73qr8nawwgsxgz83d","bc1pk89ks5h45f4ju78galw6dlh3v7qdkvq6szl0lhr3zeqq7rcfn4pskkwjdl","bc1p04m9p67mkrtpgjdyn6r2y6hpugrksu0dmqda4z7fa9smex99r0wq02r58c","bc1p6jt8k92x2a85yvg67huvnqtngwe4zx29fng0ge9z7nmw4d2897ms2zeflx","bc1p72hp42cqcywfz0e58v7uvkwl4ljxyt9gjztm8tplrctk6fuyt7vqsywhc2","bc1pvwdczg3za8dmg67ccx2s3wrnjsys887q94uml3u299v64rqpwgrqw6t6j5","bc1p49ru2yr5zeae8nwlpw692fx969mxc3r9mu3kphuyk0el7xuecjwq2l224x","bc1pw5x5tg4qfdl2wd28svvs6ayxtnqy9hava8kr5cyh8swvwe6rynvq9055gm","bc1pzzxfxvjvc2d3rjjjgttwwgecn462wtddm2duugut08npe53hjesslk5pl6","bc1pgd255z8pjqeawqzc96dwjzuuprcyp3jdckqzzlq98mf48hy29nmqst8x2y"];
console.log(userWallets.length);