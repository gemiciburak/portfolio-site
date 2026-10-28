/** JSON-LD'yi `<script>` olarak basar; `<` kaçırılır ki içerik script'i kapatamasın. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
