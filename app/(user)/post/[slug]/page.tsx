// "use client";
import { client } from "@/lib/sanity.client";
import urlFor from "@/lib/urlFor";
import groq from "groq";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "@/components/RichTextComponents";
import Link from "next/link";
import { Sawer } from "@/components/Sawer";

type Props = {
  params: {
    slug: string;
  };
};

export const revalidate = 30;

export async function generateStaticParams() {
  const query = groq`*[_type=='post']
  {
    slug
  }`;

  const slugs: Post[] = await client.fetch(query);
  const slugRoutes = slugs.map((slug) => slug.slug.current);

  return slugRoutes.map((slug) => ({
    slug,
  }));
}

async function Post({ params: { slug } }: Props) {
  const query = groq`
        *[_type=='post'&&slug.current == $slug][0]
        {
            ...,
            author->,
            categories[]->
        }
    `;
  const post: Post = await client.fetch(query, { slug });

  return (
    <>
      <Sawer />
      <article className="px-2 sm:px-10 pb-28 h-[1000px]">
        <section className="space-y-2 border border-[#0060ff] text-white rounded-md">
          <div className="relative min-h-56 flex flex-col md:flex-row justify-between">
            <div className="absolute top-0 w-full h-full opacity-10 blur-sm p-10">
              <Image
                src={urlFor(post.mainImage).url()}
                className="object-cover object-center mx-auto"
                alt={post.author.name}
                fill
              />
            </div>
            <section className="p-5 bg-[#0060ff] w-full rounded-md">
              <div className="flex flex-col md:flex-row justify-between gap-y-5">
                <div>
                  <p className=" text-4xl font-extrabold">{post.title}</p>
                  <p>
                    {new Date(post._createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Image
                    src={urlFor(post.author.image).url()}
                    className="rounded-full"
                    alt={post.author.name}
                    height={40}
                    width={40}
                  />
                  <div className="w-20">
                    <h3 className="text-lg font-bold">{post.author.name}</h3>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="italic pt-5">{post.description}</h2>
                <div className="flex items center justify-end mt-auto space-x-2">
                  {post.categories.map((category, index) => (
                    <p
                      key={category._id}
                      className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold mt-4"
                    >
                      {category.title}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
        <div className="my-5">
          <PortableText value={post.body} components={RichTextComponents} />
        </div>
        <div>
          <Link
            href="/"
            className="bg-[#0060ff] px-5 py-2 rounded-sm text-xl text-white font-bold"
          >
            Back
          </Link>
        </div>
      </article>
    </>
  );
}

export default Post;
