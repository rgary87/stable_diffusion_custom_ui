import torch, os, re, random
from datetime import datetime
from torch import autocast
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from diffusers.pipelines.stable_diffusion import safety_checker

class Generator:

    def __init__(self) -> None:
        if torch.cuda.is_available():
            print('Everything is okay')
        else:
            print('Shit fuck and bubblegum!')
            exit(255)
        self.model_id = "stabilityai/stable-diffusion-2-1-base"
        self.model_id = "prompthero/openjourney"
        self.device = "cuda"
        self.pipe = StableDiffusionPipeline.from_pretrained(self.model_id, torch_dtype=torch.float16)
        self.dmp_scheduler = DPMSolverMultistepScheduler.from_config(self.pipe.scheduler.config)
        self.pipe = self.pipe.to(self.device)
        safety_checker.StableDiffusionSafetyChecker.forward = self.sc

    def sc(self, clip_input, images) :
        return images, [False for i in images]


    def get_positive_negative_prompt(self, prompt: str) -> tuple:
        # Regular expression to match the desired pattern
        pattern = r'~(.*?),'

        # Extract the matching parts using regex
        matches = re.findall(pattern, prompt)

        # Concatenate the extracted parts into a new string
        negative_prompt = 'extra lib, too many fingers,' + ','.join(matches)

        # Remove the extracted parts from the original string
        positive_prompt = re.sub(pattern, '', prompt)
        return (positive_prompt, negative_prompt)


    def generate_single(self, prompt, negative_prompt, step, seed, dir_path, idx):
        today = datetime.today().strftime('%Y_%m_%d')
        if not os.path.exists(today):
            os.mkdir(today)
        dir_path = f"{today}\{dir_path}"
        with autocast(self.device):
            prompt = f"mdjrny-v4 style, {prompt}"
            try:
                generator = torch.Generator("cuda").manual_seed(seed+idx)
                if not os.path.exists(dir_path):
                    os.mkdir(dir_path)
                image = self.pipe(prompt, negative_prompt=negative_prompt, guidance_scale=9, num_inference_steps=step, generator=generator).images[0]
                image_name = f'{dir_path}\\{idx}_{step}_{prompt.replace(" ", "_").replace(",", "").replace("|", "").replace(":", "").replace(".", "")[:120]}.png'
                if os.path.exists(image_name):
                    image_name = image_name[:-4] + '(2).png'
                image.save(image_name)
                return image_name
            except Exception as e:
                print(f'Exception: {e}')
                pass


    def generate(self, prompt, negative_prompt, step, seed, generate_count):
        # edit StableDiffusionSafetyChecker class so that, when called, it just returns the images and an array of True values

        # scheduler = EulerDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
        # pipe = StableDiffusionPipeline.from_pretrained(model_id, revision="fp16", torch_dtype=torch.float16)

        with autocast(self.device):
            prompt = f"mdjrny-v4 style, {prompt}"
            try:
                dir_path = str(hash(prompt * random.randint(0, 10000)))
                for i in range(0, generate_count):
                    self.generate_single(prompt, negative_prompt, step, seed, dir_path, i)
            except Exception as e:
                print(f'Exception: {e}')
                pass


    # An hyperrealistic picture of Weeny the Poo, smoking a big joint, being stoned, surrounded by nature, sitted on the ground, its back against a tree