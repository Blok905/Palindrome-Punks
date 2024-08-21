let userWallet;
document.getElementById("walletSubmit").onclick = function(){
    userWallet = document.getElementById("wallet").value;
    console.log(userWallet)
    if (userWallets.includes(userWallet)){
        showAlert("Congratulations... You are Punk-Listed");
    } else {
        showAlert("Sorry... you are not Punk-Listed");
    }
}
function showAlert(message) {
    const alertBox = document.getElementById('cypherPunkAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerText = '';
    alertBox.style.display = 'block';
    alertBox.classList.remove('fade-out');

    let i = 0;
    function typeWriter() {
        if (i < message.length) {
            alertMessage.innerHTML += message.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            setTimeout(() => {
                alertBox.classList.add('fade-out');
                setTimeout(() => {
                    alertBox.style.display = 'none';
                }, 1000); // matches the fade-out transition duration
            }, 3000);
        }
    }

    typeWriter();
}


let userWallets = ["bc1pgd255z8pjqeawqzc96dwjzuuprcyp3jdckqzzlq98mf48hy29nmqst8x2y","bc1p7amp0z7c9vwlzwmxqms5sswdrh5g655tycxya42pafz72tpzjxfqjz3f5l","bc1pa8apt0p0ktkfva4r6jdn63psdm96q2lyngpls8u58vjaghyyn39s7h3q9a","bc1p4ygxn36ra3yevhmqemwagkurwhgtety6rk06gecptnn6z42rtvgq6hzhvw","bc1p6jt8k92x2a85yvg67huvnqtngwe4zx29fng0ge9z7nmw4d2897ms2zeflx","bc1phas893eyd2e3tplzhwfa4qkwzp24xxlh6lwey5dcw73qr8nawwgsxgz83d","bc1pk89ks5h45f4ju78galw6dlh3v7qdkvq6szl0lhr3zeqq7rcfn4pskkwjdl","bc1pugkm5m3ymqxpmfh5akj8x3m4e34cuq0gkk2a4fyw9uyjy6ttmd3s07ytmh","bc1pzzxfxvjvc2d3rjjjgttwwgecn462wtddm2duugut08npe53hjesslk5pl6","bc1p04m9p67mkrtpgjdyn6r2y6hpugrksu0dmqda4z7fa9smex99r0wq02r58c","bc1p44ka9smp276xevqj6h3gmc89euykwzqzrzf88ry6cc8a7cvs0weqag9t59","bc1p49ru2yr5zeae8nwlpw692fx969mxc3r9mu3kphuyk0el7xuecjwq2l224x","bc1p72hp42cqcywfz0e58v7uvkwl4ljxyt9gjztm8tplrctk6fuyt7vqsywhc2","bc1pcuk5v64v8a5la7tfdlul2l8953xdr98xyzu9nwuek0gql8967w4qxkdqc9","bc1pfmgdmenmxsrxj6klln95c2a352n8mh3vgfe2yxqxyjmeck4xh4kqq4qfys","bc1psdxhkyc7w8eadwccaad03w9t7cuarmndr8c9t9wnvu3jyg83v7mq7x4p7a","bc1pvwdczg3za8dmg67ccx2s3wrnjsys887q94uml3u299v64rqpwgrqw6t6j5", "bc1pw5x5tg4qfdl2wd28svvs6ayxtnqy9hava8kr5cyh8swvwe6rynvq9055gm","bc1pwghem72jqjxttmwpjukpj2s4vns3pznkynd0qf3masy9e7t63aassy508d","bc1qgvy0rwn2mkd6np2paclwrncuvumf5askzmreva"];
console.log(userWallets.length);


document.addEventListener('mousemove', (event) => {
    const outerEye = document.querySelector('.outer-eye');
    const midEye = document.querySelector('.mid-eye');
    const innerEye = document.querySelector('.inner-eye');
    const pupil = document.querySelector('.pupil');
            
    // Outer Eye (boundary for the inner-eye)
    const eyeRect = outerEye.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Mid Eye (boundary for the inner-eye)
    const midEyeRect = midEye.getBoundingClientRect();
    const maxInnerEyeDistance = Math.min(midEyeRect.width, midEyeRect.height) / 2 - innerEye.offsetWidth / 2;

    // Calculate the angle and distance from the center of the outer eye
    const angle = Math.atan2(event.clientY - eyeCenterY, event.clientX - eyeCenterX);
    const innerEyeDistance = Math.min(maxInnerEyeDistance, Math.sqrt((event.clientX - eyeCenterX) ** 2 + (event.clientY - eyeCenterY) ** 2) / 2);

    // Calculate inner eye position
    const innerEyeX = innerEyeDistance * Math.cos(angle);
    const innerEyeY = innerEyeDistance * Math.sin(angle);
    innerEye.style.transform = `translate(${innerEyeX}px, ${innerEyeY}px)`;

    // Pupil (within inner-eye boundary)
    const innerEyeRect = innerEye.getBoundingClientRect();
    const pupilMaxDistance = Math.min(innerEyeRect.width, innerEyeRect.height) / 2 - pupil.offsetWidth / 2;

    // Calculate pupil position within the inner-eye
    const pupilDistance = Math.min(pupilMaxDistance, innerEyeDistance);
    const pupilX = pupilDistance * Math.cos(angle);
    const pupilY = pupilDistance * Math.sin(angle);
    pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
});
