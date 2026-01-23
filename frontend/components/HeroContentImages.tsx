import Image from 'next/image'

export default function HeroContentImages() {
    return (
        <div className="relative md:mt-10">
            <div className="backdrop-blur-md border border-white/20 rounded-2xl p-3">
                <div className="grid grid-cols-3 gap-3  ">
                    <div className="col-span-2 row-span-2 relative lg:rounded-lg overflow-hidden bg-primary">
                        <Image
                            src='/auth/girl.jpg'
                            width={800}
                            height={600}
                            alt='Main participant'
                            className="w-full h-full object-cover"
                        />

                    </div>

                    <div className="relative lg:rounded-lg overflow-hidden bg-primary">
                        <Image
                            src='/auth/home.jpg'
                            width={200}
                            height={200}
                            alt='Participant'
                            className="w-full h-full object-cover"
                        />
                    </div>




                    <div className="relative lg:rounded-lg overflow-hidden bg-primary">
                        <Image
                            src='/auth/young.jpg'
                            width={400}
                            height={200}
                            alt='Participant'
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
